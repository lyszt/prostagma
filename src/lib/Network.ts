type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

interface NetworkConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  validateStatus?: (status: number) => boolean;
  retryConfig?: RetryConfig;
}

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryOn?: number[];
  shouldRetry?: (error: NetworkError) => boolean;
}

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  params?: Record<string, string | number | boolean>;
  retries?: number;
}

interface NetworkResponse<T = JsonValue> {
  status: number;
  ok: boolean;
  statusText: string;
  headers: Headers;
  body: T | null;
}

type RequestInterceptor = (
  url: string,
  options: RequestInit,
) => Promise<{ url: string; options: RequestInit }> | { url: string; options: RequestInit };

type ResponseInterceptor = <T = JsonValue>(
  response: NetworkResponse<T>,
) => Promise<NetworkResponse<T>> | NetworkResponse<T>;

class NetworkError extends Error {
  status: number;
  statusText: string;
  response?: JsonValue;

  constructor(
    message: string,
    status: number,
    statusText: string,
    response?: JsonValue,
  ) {
    super(message);
    this.name = "NetworkError";
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

class Network {
  private baseURL: string = "";
  private defaultTimeout: number = 30000; // 30 seconds
  private defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  private validateStatus: (status: number) => boolean = (status) =>
    status >= 200 && status < 300;
  private retryConfig: RetryConfig = {
    maxRetries: 0,
    retryDelay: 1000,
    retryOn: [408, 429, 500, 502, 503, 504],
  };
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config?: NetworkConfig | string) {
    if (typeof config === "string") {
      this.baseURL = config;
    } else if (config) {
      this.baseURL = config.baseURL || "";
      this.defaultTimeout = config.timeout || this.defaultTimeout;
      this.defaultHeaders = { ...this.defaultHeaders, ...config.headers };
      if (config.validateStatus) {
        this.validateStatus = config.validateStatus;
      }
      if (config.retryConfig) {
        this.retryConfig = { ...this.retryConfig, ...config.retryConfig };
      }
    }
  }

  /**
   * Sets or updates the base URL
   */
  setBaseURL(url: string): void {
    if (!url || typeof url !== "string") {
      throw new Error("Base URL must be a non-empty string");
    }
    this.baseURL = url;
  }

  /**
   * Sets or updates default headers
   */
  setHeader(key: string, value: string): void {
    if (!key || typeof key !== "string") {
      throw new Error("Header key must be a non-empty string");
    }
    this.defaultHeaders[key] = value;
  }

  /**
   * Removes a default header
   */
  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  /**
   * Adds a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Adds a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Builds query string from params object
   */
  private buildQueryString(params: Record<string, string | number | boolean>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    return searchParams.toString();
  }

  /**
   * Gets the full URL by combining base URL and endpoint with query params
   */
  private getFullURL(endpoint: string = "", params?: Record<string, string | number | boolean>): string {
    if (!this.baseURL && !endpoint) {
      throw new Error(
        "URL is required. Set baseURL in constructor or provide endpoint.",
      );
    }

    // If endpoint is a full URL, use it directly
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      if (params) {
        const separator = endpoint.includes("?") ? "&" : "?";
        return `${endpoint}${separator}${this.buildQueryString(params)}`;
      }
      return endpoint;
    }

    // Combine baseURL and endpoint
    const base = this.baseURL.endsWith("/")
      ? this.baseURL.slice(0, -1)
      : this.baseURL;
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    let url = base + path;

    // Add query parameters
    if (params) {
      url += `?${this.buildQueryString(params)}`;
    }

    return url;
  }

  /**
   * Creates an AbortController with timeout
   */
  private createTimeoutSignal(
    timeout: number,
    externalSignal?: AbortSignal,
  ): AbortSignal {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // If an external signal is provided, link it
    if (externalSignal) {
      externalSignal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        controller.abort();
      });
    }

    // Clean up timeout on abort
    controller.signal.addEventListener("abort", () => clearTimeout(timeoutId));

    return controller.signal;
  }

  /**
   * Delays execution for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculates exponential backoff delay
   */
  private getRetryDelay(attempt: number, baseDelay: number): number {
    return baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
  }

  /**
   * Determines if request should be retried
   */
  private shouldRetryRequest(error: NetworkError, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) {
      return false;
    }

    if (this.retryConfig.shouldRetry) {
      return this.retryConfig.shouldRetry(error);
    }

    return this.retryConfig.retryOn?.includes(error.status) ?? false;
  }

  /**
   * Core request method with retry logic
   */
  private async request<T = JsonValue>(
    endpoint: string,
    method: string,
    body?: JsonValue | string | FormData,
    options?: RequestOptions,
  ): Promise<NetworkResponse<T>> {
    const maxRetries = options?.retries ?? this.retryConfig.maxRetries ?? 0;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await this.executeRequest<T>(endpoint, method, body, options);
      } catch (error) {
        if (error instanceof NetworkError && attempt < maxRetries) {
          if (this.shouldRetryRequest(error, attempt, maxRetries)) {
            const delay = this.getRetryDelay(
              attempt,
              this.retryConfig.retryDelay ?? 1000,
            );
            await this.delay(delay);
            attempt++;
            continue;
          }
        }
        throw error;
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new NetworkError("Request failed after retries", 0, "Unknown");
  }

  /**
   * Executes a single request
   */
  private async executeRequest<T = JsonValue>(
    endpoint: string,
    method: string,
    body?: JsonValue | string | FormData,
    options?: RequestOptions,
  ): Promise<NetworkResponse<T>> {
    let url = this.getFullURL(endpoint, options?.params);
    const timeout = options?.timeout || this.defaultTimeout;
    let headers = { ...this.defaultHeaders, ...options?.headers };

    // Create abort signal with timeout
    const signal = this.createTimeoutSignal(timeout, options?.signal);

    let init: RequestInit = {
      method,
      headers,
      signal,
    };

    // Add body for methods that support it
    if (body !== undefined && method !== "GET" && method !== "HEAD") {
      if (body instanceof FormData) {
        init.body = body;
        // Remove Content-Type header for FormData (browser sets it with boundary)
        const headersObj = { ...headers };
        delete headersObj["Content-Type"];
        init.headers = headersObj;
      } else {
        init.body = typeof body === "string" ? body : JSON.stringify(body);
      }
    }

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor(url, init);
      url = result.url;
      init = result.options;
    }

    try {
      const response = await fetch(url, init);

      // Check if response is OK based on status code
      if (!this.validateStatus(response.status)) {
        let errorData: JsonValue | undefined;
        try {
          errorData = await response.json();
        } catch {
          // Response body is not JSON
          try {
            errorData = { message: await response.text() };
          } catch {
            errorData = undefined;
          }
        }

        throw new NetworkError(
          `Request failed with status ${response.status}`,
          response.status,
          response.statusText,
          errorData,
        );
      }

      // Handle empty responses
      const contentLength = response.headers.get("content-length");
      if (contentLength === "0" || response.status === 204) {
        let result: NetworkResponse<T> = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          headers: response.headers,
          body: null,
        };

        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          result = await interceptor(result);
        }

        return result;
      }

      // Read the response body only once (as text) and parse if JSON
      let text: string | null = null;
      try {
        text = await response.text();
      } catch {
        text = null;
      }

      let parsedBody: T | null = null;
      if (text !== null && text !== "") {
        try {
          parsedBody = JSON.parse(text) as T;
        } catch {
          parsedBody = text as unknown as T;
        }
      }

      let result: NetworkResponse<T> = {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: response.headers,
        body: parsedBody,
      };

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        result = await interceptor(result);
      }

      return result;
    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }

      // Handle abort/timeout errors
      if (error instanceof Error && error.name === "AbortError") {
        throw new NetworkError("Request timeout", 408, "Request Timeout");
      }

      // Handle other fetch errors
      if (error instanceof TypeError) {
        throw new NetworkError(
          `Network request failed: ${error.message}`,
          0,
          "Network Error",
        );
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = JsonValue>(endpoint: string, options?: RequestOptions): Promise<NetworkResponse<T>> {
    return await this.request<T>(endpoint, "GET", undefined, options);
  }

  /**
   * POST request
   */
  async post<T = JsonValue>(
    endpoint: string,
    body?: JsonValue | string | FormData,
    options?: RequestOptions,
  ): Promise<NetworkResponse<T>> {
    return await this.request<T>(endpoint, "POST", body, options);
  }

  /**
   * PUT request
   */
  async put<T = JsonValue>(
    endpoint: string,
    body?: JsonValue | string | FormData,
    options?: RequestOptions,
  ): Promise<NetworkResponse<T>> {
    return await this.request<T>(endpoint, "PUT", body, options);
  }

  /**
   * PATCH request
   */
  async patch<T = JsonValue>(
    endpoint: string,
    body?: JsonValue | string | FormData,
    options?: RequestOptions,
  ): Promise<NetworkResponse<T>> {
    return await this.request<T>(endpoint, "PATCH", body, options);
  }

  /**
   * DELETE request
   */
  async delete<T = JsonValue>(endpoint: string, options?: RequestOptions): Promise<NetworkResponse<T>> {
    return await this.request<T>(endpoint, "DELETE", undefined, options);
  }

  /**
   * HEAD request
   */
  async head<T = JsonValue>(endpoint: string, options?: RequestOptions): Promise<NetworkResponse<T>> {
    return await this.request<T>(endpoint, "HEAD", undefined, options);
  }

  /**
   * OPTIONS request
   */
  async options<T = JsonValue>(endpoint: string, options?: RequestOptions): Promise<NetworkResponse<T>> {
    return await this.request<T>(endpoint, "OPTIONS", undefined, options);
  }

  /**
   * Upload file using FormData
   */
  async upload<T = JsonValue>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions,
  ): Promise<NetworkResponse<T>> {
    return await this.request<T>(endpoint, "POST", formData, options);
  }
}

export default Network;
export {
  NetworkError,
  type NetworkConfig,
  type RequestOptions,
  type NetworkResponse,
  type JsonValue,
  type JsonObject,
  type JsonArray,
  type RequestInterceptor,
  type ResponseInterceptor,
  type RetryConfig,
};
