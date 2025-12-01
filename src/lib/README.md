# Network Class

A modern, production-ready TypeScript HTTP client with advanced features including retry logic, interceptors, type safety, and comprehensive error handling.

## Features

- 🚀 Simple and intuitive API
- 🎯 **Generic type support** for type-safe responses
- 🔄 **Automatic retry with exponential backoff**
- 🎣 **Request/Response interceptors**
- 📋 **Query parameter handling**
- 📁 **FormData support** for file uploads
- ⏱️ Built-in timeout support (default: 30 seconds)
- 🔒 Type-safe with TypeScript
- 🎯 Custom error handling with `NetworkError` class
- 🔧 Configurable default headers
- 📦 Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- 🎨 Per-request header overrides
- ⚡ Abort signal support
- 🌐 Automatic JSON parsing
- ✅ Status code validation
- 📊 Full response metadata access (headers, status, etc.)

## Installation

```typescript
import Network from './lib/Network';
```

## Basic Usage

### Simple GET Request with Type Safety

```typescript
import Network, { type NetworkResponse } from './lib/Network';

interface User {
  id: number;
  name: string;
  email: string;
}

const api = new Network('https://api.example.com');

try {
  const res: NetworkResponse<User[]> = await api.get<User[]>('/users');
  if (res.ok && res.body) {
    console.log('Users:', res.body); // TypeScript knows this is User[]
    console.log('Status:', res.status);
    console.log('Headers:', res.headers);
  } else {
    console.error('Failed:', res.status, res.body);
  }
} catch (error) {
  if (error instanceof NetworkError) {
    console.error(`Error ${error.status}: ${error.message}`);
  }
}
```

### POST Request with Generic Types

```typescript
interface CreateUserPayload {
  name: string;
  email: string;
  role: string;
}

interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const newUser: CreateUserPayload = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
};

try {
  const response: NetworkResponse<UserResponse> = await api.post<UserResponse>('/users', newUser);
  if (response.ok && response.body) {
    console.log('Created user ID:', response.body.id);
  }
} catch (error) {
  console.error('Failed to create user:', error);
}
```

## Advanced Configuration

### Constructor with Full Config

```typescript
import Network, { type NetworkConfig } from './lib/Network';

const config: NetworkConfig = {
  baseURL: 'https://api.example.com',
  timeout: 5000, // 5 seconds
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'X-Custom-Header': 'CustomValue'
  },
  validateStatus: (status) => status >= 200 && status < 500,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    retryOn: [408, 429, 500, 502, 503, 504],
    shouldRetry: (error) => error.status === 503 // Custom retry logic
  }
};

const api = new Network(config);
```

## New Features

### 1. Query Parameters

Automatically handle query parameters without manual string concatenation:

```typescript
// Old way: '/users?page=1&limit=10&sort=name'
// New way:
const response = await api.get<User[]>('/users', {
  params: {
    page: 1,
    limit: 10,
    sort: 'name',
    active: true
  }
});
// Requests: /users?page=1&limit=10&sort=name&active=true
```

### 2. Request Interceptors

Modify all requests before they're sent:

```typescript
// Add authentication token to all requests
const removeInterceptor = api.addRequestInterceptor(async (url, options) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return { url, options };
});

// Remove interceptor when no longer needed
removeInterceptor();
```

```typescript
// Log all requests
api.addRequestInterceptor((url, options) => {
  console.log(`[${options.method}] ${url}`);
  return { url, options };
});
```

### 3. Response Interceptors

Transform all responses:

```typescript
// Add timestamp to all responses
api.addResponseInterceptor((response) => {
  return {
    ...response,
    body: response.body ? {
      ...response.body,
      _fetchedAt: new Date().toISOString()
    } : null
  };
});
```

```typescript
// Handle global error logging
api.addResponseInterceptor((response) => {
  if (!response.ok) {
    console.error(`API Error: ${response.status} - ${response.statusText}`);
  }
  return response;
});
```

### 4. Automatic Retry with Exponential Backoff

Configure automatic retries for failed requests:

```typescript
const api = new Network({
  baseURL: 'https://api.example.com',
  retryConfig: {
    maxRetries: 3,           // Retry up to 3 times
    retryDelay: 1000,        // Base delay of 1 second
    retryOn: [408, 429, 500, 502, 503, 504], // Retry on these status codes
  }
});

// Request will automatically retry with exponential backoff:
// Attempt 1: immediate
// Attempt 2: ~2 seconds later
// Attempt 3: ~4 seconds later
// Attempt 4: ~8 seconds later
const response = await api.get('/unstable-endpoint');
```

```typescript
// Per-request retry override
const response = await api.get('/critical-endpoint', {
  retries: 5  // Override global retry config for this request
});
```

### 5. File Upload with FormData

Upload files easily with automatic Content-Type handling:

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'My Document');
formData.append('category', 'reports');

// Using the upload method
const response = await api.upload<{id: string, url: string}>('/documents', formData);

// Or using post directly
const response = await api.post<{id: string}>('/documents', formData);
```

### 6. Response Metadata

Access full response metadata:

```typescript
const response = await api.get<User>('/users/123');

console.log('Status:', response.status);           // 200
console.log('OK:', response.ok);                    // true
console.log('Status Text:', response.statusText);   // "OK"
console.log('Content-Type:', response.headers.get('content-type'));
console.log('Rate Limit:', response.headers.get('x-ratelimit-remaining'));
console.log('Body:', response.body);                // User object
```

## HTTP Methods

### GET

```typescript
const usersRes = await api.get<User[]>('/users');
const userRes = await api.get<User>('/users/123');

// With query parameters
const filteredRes = await api.get<User[]>('/users', {
  params: { role: 'admin', active: true }
});
```

### POST

```typescript
const response = await api.post<User>('/users', {
  name: 'John',
  email: 'john@example.com'
});
```

### PUT (Full Update)

```typescript
const updated = await api.put<User>('/users/123', {
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: 'admin'
});
```

### PATCH (Partial Update)

```typescript
const updated = await api.patch<User>('/users/123', { active: false });
```

### DELETE

```typescript
const deleteRes = await api.delete('/users/123');
if (!deleteRes.ok) {
  console.error('Failed to delete:', deleteRes.status);
}
```

### HEAD

```typescript
// Check if resource exists
const exists = await api.head('/users/123');
console.log('User exists:', exists.ok);
```

### OPTIONS

```typescript
// Check available methods
const methods = await api.options('/users');
console.log('Allowed methods:', methods.headers.get('allow'));
```

## Request Options

All methods accept an optional `RequestOptions` parameter:

```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  params?: Record<string, string | number | boolean>;
  retries?: number;
}
```

### Custom Headers per Request

```typescript
const response = await api.get<User>('/users', {
  headers: {
    'X-Request-ID': 'unique-request-id-123',
    'Accept-Language': 'en-US'
  }
});
```

### Custom Timeout per Request

```typescript
try {
  const response = await api.get('/slow-endpoint', {
    timeout: 1000  // 1 second timeout
  });
} catch (error) {
  if (error instanceof NetworkError && error.status === 408) {
    console.log('Request timed out');
  }
}
```

### Manual Abort Signal

```typescript
const controller = new AbortController();

setTimeout(() => controller.abort(), 2000);

try {
  const response = await api.get('/users', {
    signal: controller.signal
  });
} catch (error) {
  console.log('Request was aborted');
}
```

## Error Handling

### NetworkError Class

```typescript
class NetworkError extends Error {
  status: number;        // HTTP status code (0 for network errors)
  statusText: string;    // HTTP status text
  response?: JsonValue;  // Server response body (if available)
}
```

### Comprehensive Error Handling

```typescript
try {
  const response = await api.get<User[]>('/users');
} catch (error) {
  if (error instanceof NetworkError) {
    console.log('Status:', error.status);
    console.log('Status Text:', error.statusText);
    console.log('Server Response:', error.response);

    switch (error.status) {
      case 404:
        console.log('Resource not found');
        break;
      case 401:
        console.log('Unauthorized - please login');
        break;
      case 403:
        console.log('Forbidden - insufficient permissions');
        break;
      case 408:
        console.log('Request timeout');
        break;
      case 429:
        console.log('Too many requests - rate limited');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        console.log('Server error - will retry automatically');
        break;
      default:
        console.log('An error occurred');
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Real-World Examples

### Authentication Flow with Interceptors

```typescript
const api = new Network({
  baseURL: 'https://api.example.com',
  timeout: 10000
});

// Auto-attach token to all requests
api.addRequestInterceptor((url, options) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return { url, options };
});

// Auto-refresh token on 401
api.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      // Refresh token logic here
      const newToken = await refreshAuthToken(refreshToken);
      localStorage.setItem('auth_token', newToken);
      // Could re-attempt the original request here
    }
  }
  return response;
});

// Login
const loginRes = await api.post<{token: string, refreshToken: string}>('/auth/login', {
  username: 'user@example.com',
  password: 'secure-password'
});

if (loginRes.ok && loginRes.body) {
  localStorage.setItem('auth_token', loginRes.body.token);
  localStorage.setItem('refresh_token', loginRes.body.refreshToken);
}
```

### Pagination with Query Parameters

```typescript
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

async function fetchAllUsers(api: Network): Promise<User[]> {
  let allUsers: User[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const response = await api.get<PaginatedResponse<User>>('/users', {
      params: { page, pageSize }
    });

    if (!response.ok || !response.body) break;

    allUsers = allUsers.concat(response.body.data);

    if (allUsers.length >= response.body.total) break;
    page++;
  }

  return allUsers;
}
```

### File Upload with Progress

```typescript
async function uploadDocument(file: File, onProgress?: (percent: number) => void) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('metadata', JSON.stringify({
    uploadedBy: 'user123',
    category: 'invoices'
  }));

  interface UploadResponse {
    id: string;
    url: string;
    size: number;
  }

  const response = await api.upload<UploadResponse>('/documents', formData, {
    timeout: 120000, // 2 minutes for large files
    retries: 2
  });

  if (response.ok && response.body) {
    console.log('File uploaded:', response.body.url);
    return response.body;
  }

  throw new Error('Upload failed');
}
```

## Type Definitions

```typescript
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
```

## Response Handling

- **JSON responses**: Automatically parsed to typed objects
- **Empty responses**: Returns `null` for 204 No Content or Content-Length: 0
- **Text responses**: Returns as string for non-JSON content
- **Error responses**: Throws `NetworkError` with server response included
- **Metadata**: Full access to status, headers, and status text

## Default Retry Behavior

By default, requests will **not** retry. To enable retries:

```typescript
// Global retry config
const api = new Network({
  baseURL: 'https://api.example.com',
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    retryOn: [408, 429, 500, 502, 503, 504]
  }
});

// Per-request retry
const response = await api.get('/endpoint', { retries: 2 });
```

Retry uses exponential backoff: delay × 2^attempt + random jitter

## Status Code Validation

By default, status codes 200-299 are successful. Customize:

```typescript
const api = new Network({
  baseURL: 'https://api.example.com',
  validateStatus: (status) => status >= 200 && status < 500
});
```

## Best Practices

1. **Use generic types**: Leverage TypeScript generics for type-safe responses
2. **Handle errors properly**: Always wrap requests in try-catch blocks
3. **Use interceptors for cross-cutting concerns**: Authentication, logging, error handling
4. **Configure retries for resilience**: Enable retries for idempotent operations (GET, PUT, DELETE)
5. **Use query params**: Utilize the `params` option instead of manual string concatenation
6. **Set appropriate timeouts**: Configure based on expected response times
7. **Validate response structure**: Check `response.ok` and `response.body` before accessing data
8. **Use abort signals**: For requests that may need cancellation (e.g., component unmount)
9. **Access response metadata**: Use `headers`, `status`, and `statusText` for detailed information

## Migration Guide

### From Old Version

**Before:**
```typescript
const res = await api.get('/users');
const users = res.body as unknown as User[];
```

**After:**
```typescript
const res = await api.get<User[]>('/users');
if (res.ok && res.body) {
  const users = res.body; // Already typed as User[]
}
```

## License

MIT
