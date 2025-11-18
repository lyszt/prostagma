# Network Class

A modern, TypeScript-based HTTP client with built-in error handling, timeout support, and flexible configuration options.

## Features

- 🚀 Simple and intuitive API
- ⏱️ Built-in timeout support (default: 30 seconds)
- 🔒 Type-safe with TypeScript
- 🎯 Custom error handling with `NetworkError` class
- 🔧 Configurable default headers
- 📦 Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- 🎨 Per-request header overrides
- ⚡ Abort signal support
- 🌐 Automatic JSON parsing
- ✅ Status code validation

## Installation

```typescript
import Network from './lib/Network';
```

## Basic Usage

### Simple GET Request

```typescript
const api = new Network('https://api.example.com');

try {
  const data = await api.get('/users');
  console.log('Users:', data);
} catch (error) {
  if (error instanceof NetworkError) {
    console.error(`Error ${error.status}: ${error.message}`);
  }
}
```

### POST Request

```typescript
const api = new Network('https://api.example.com');

const newUser = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
};

try {
  const response = await api.post('/users', newUser);
  console.log('Created user:', response);
} catch (error) {
  console.error('Failed to create user:', error);
}
```

## Advanced Configuration

### Constructor with Config Object

```typescript
import Network, { type NetworkConfig } from './lib/Network';

const config: NetworkConfig = {
  baseURL: 'https://api.example.com',
  timeout: 5000, // 5 seconds
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'X-Custom-Header': 'CustomValue'
  },
  validateStatus: (status) => status >= 200 && status < 500
};

const api = new Network(config);
```

### Dynamic Header Management

```typescript
const api = new Network('https://api.example.com');

// Add header
api.setHeader('Authorization', 'Bearer token123');

// Remove header
api.removeHeader('Authorization');

// Update base URL
api.setBaseURL('https://new-api.example.com');
```

## HTTP Methods

### GET

```typescript
const data = await api.get('/users');
const user = await api.get('/users/123');
```

### POST

```typescript
const response = await api.post('/users', { name: 'John', email: 'john@example.com' });
```

### PUT (Full Update)

```typescript
const updated = await api.put('/users/123', {
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: 'admin'
});
```

### PATCH (Partial Update)

```typescript
const updated = await api.patch('/users/123', { active: false });
```

### DELETE

```typescript
await api.delete('/users/123');
```

### HEAD

```typescript
// Check if resource exists without downloading body
const exists = await api.head('/users/123');
```

### OPTIONS

```typescript
// Check available HTTP methods
const methods = await api.options('/users');
```

## Request Options

All methods accept an optional `RequestOptions` parameter:

```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}
```

### Custom Headers per Request

```typescript
const response = await api.get('/users', {
  headers: {
    'X-Request-ID': 'unique-request-id-123',
    'Accept-Language': 'en-US'
  }
});
```

### Custom Timeout per Request

```typescript
try {
  // This request will timeout after 1 second
  const response = await api.get('/slow-endpoint', {
    timeout: 1000
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

// Cancel request after 2 seconds
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

The `NetworkError` class provides detailed error information:

```typescript
class NetworkError extends Error {
  status: number;        // HTTP status code (0 for network errors)
  statusText: string;    // HTTP status text
  response?: JsonValue;  // Server response body (if available)
}
```

### Handling Different Error Types

```typescript
try {
  const response = await api.get('/users');
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
      case 500:
        console.log('Server error');
        break;
      default:
        console.log('An error occurred');
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Authentication Flow Example

```typescript
const api = new Network({
  baseURL: 'https://api.example.com',
  timeout: 10000
});

// 1. Login
const loginResponse = await api.post('/auth/login', {
  username: 'user@example.com',
  password: 'secure-password'
});

if (loginResponse && typeof loginResponse === 'object' && 'token' in loginResponse) {
  // 2. Set token for future requests
  api.setHeader('Authorization', `Bearer ${loginResponse.token}`);

  // 3. Fetch protected data
  const userData = await api.get('/user/profile');
  
  // 4. Update profile
  const updatedProfile = await api.patch('/user/profile', {
    displayName: 'New Display Name'
  });

  // 5. Logout
  await api.post('/auth/logout', {});
  api.removeHeader('Authorization');
}
```

## Default Headers

The Network class includes the following default headers:

```typescript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

You can override these globally or per-request.

## URL Handling

### Base URL + Endpoint

```typescript
const api = new Network('https://api.example.com');
await api.get('/users'); // Requests: https://api.example.com/users
```

### Full URL (Bypasses Base URL)

```typescript
const api = new Network('https://api.example.com');
await api.get('https://another-api.com/data'); // Requests: https://another-api.com/data
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
}

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}
```

## Response Handling

- **JSON responses**: Automatically parsed based on `Content-Type: application/json`
- **Empty responses**: Returns `null` for 204 No Content or Content-Length: 0
- **Text responses**: Returns as string for non-JSON content types
- **Error responses**: Throws `NetworkError` with server response included

## Status Code Validation

By default, status codes between 200-299 are considered successful. You can customize this:

```typescript
const api = new Network({
  baseURL: 'https://api.example.com',
  validateStatus: (status) => status >= 200 && status < 500 // Accept 4xx errors
});
```

## Best Practices

1. **Always handle errors**: Wrap requests in try-catch blocks
2. **Use appropriate HTTP methods**: GET for reading, POST for creating, PUT/PATCH for updating, DELETE for removing
3. **Set authentication headers**: Use `setHeader()` after login and `removeHeader()` after logout
4. **Configure timeouts**: Set reasonable timeouts based on expected response times
5. **Type-check responses**: Validate response structure before accessing properties
6. **Use abort signals**: For requests that may need to be cancelled (e.g., on component unmount)

## License

MIT