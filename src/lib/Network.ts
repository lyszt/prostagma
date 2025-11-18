type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

interface NetworkConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  validateStatus?: (status: number) => boolean;
}

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

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
   * Gets the full URL by combining base URL and endpoint
   */
  private getFullURL(endpoint: string = ""): string {
    if (!this.baseURL && !endpoint) {
      throw new Error(
        "URL is required. Set baseURL in constructor or provide endpoint.",
      );
    }

    // If endpoint is a full URL, use it directly
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      return endpoint;
    }

    // Combine baseURL and endpoint
    const base = this.baseURL.endsWith("/")
      ? this.baseURL.slice(0, -1)
      : this.baseURL;
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return base + path;
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
   * Core request method
   */
  private async request(
    endpoint: string,
    method: string,
    body?: JsonValue | string,
    options?: RequestOptions,
  ): Promise<JsonValue> {
    const url = this.getFullURL(endpoint);
    const timeout = options?.timeout || this.defaultTimeout;
    const headers = { ...this.defaultHeaders, ...options?.headers };

    // Create abort signal with timeout
    const signal = this.createTimeoutSignal(timeout, options?.signal);

    const init: RequestInit = {
      method,
      headers,
      signal,
    };

    // Add body for methods that support it
    if (body !== undefined && method !== "GET" && method !== "HEAD") {
      init.body = typeof body === "string" ? body : JSON.stringify(body);
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
          errorData = { message: await response.text() };
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
        return null;
      }

      // Parse response based on content type
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return await response.text();
      }
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
  async get(
    endpoint: string = "",
    options?: RequestOptions,
  ): Promise<JsonValue> {
    return this.request(endpoint, "GET", undefined, options);
  }

  /**
   * POST request
   */
  async post(
    endpoint: string = "",
    data?: JsonValue | string,
    options?: RequestOptions,
  ): Promise<JsonValue> {
    if (data === undefined || data === null) {
      throw new Error(
        "POST request requires data. Use null explicitly if needed.",
      );
    }
    return this.request(endpoint, "POST", data, options);
  }

  /**
   * PUT request
   */
  async put(
    endpoint: string = "",
    data?: JsonValue | string,
    options?: RequestOptions,
  ): Promise<JsonValue> {
    if (data === undefined || data === null) {
      throw new Error(
        "PUT request requires data. Use null explicitly if needed.",
      );
    }
    return this.request(endpoint, "PUT", data, options);
  }

  /**
   * PATCH request
   */
  async patch(
    endpoint: string = "",
    data?: JsonValue | string,
    options?: RequestOptions,
  ): Promise<JsonValue> {
    return this.request(endpoint, "PATCH", data, options);
  }

  /**
   * DELETE request
   */
  async delete(
    endpoint: string = "",
    options?: RequestOptions,
  ): Promise<JsonValue> {
    return this.request(endpoint, "DELETE", undefined, options);
  }

  /**
   * HEAD request
   */
  async head(
    endpoint: string = "",
    options?: RequestOptions,
  ): Promise<JsonValue> {
    return this.request(endpoint, "HEAD", undefined, options);
  }

  /**
   * OPTIONS request
   */
  async options(
    endpoint: string = "",
    options?: RequestOptions,
  ): Promise<JsonValue> {
    return this.request(endpoint, "OPTIONS", undefined, options);
  }
}

export default Network;
export {
  NetworkError,
  type NetworkConfig,
  type RequestOptions,
  type JsonValue,
  type JsonObject,
  type JsonArray,
};
