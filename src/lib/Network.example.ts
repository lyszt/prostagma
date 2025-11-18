/**
 * Network.ts Usage Examples
 *
 * This file demonstrates how to use the enhanced Network class
 * with various configurations and HTTP methods.
 */

import Network, { NetworkError, type NetworkConfig } from "./Network";

// ============================================================================
// EXAMPLE 1: Basic Usage with String URL
// ============================================================================
async function basicUsage() {
  const api = new Network("https://api.example.com");

  try {
    // Simple GET request
    const data = await api.get("/users");
    console.log("Users:", data);
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
  }
}

// ============================================================================
// EXAMPLE 2: Advanced Configuration
// ============================================================================
async function advancedConfiguration() {
  const config: NetworkConfig = {
    baseURL: "https://api.example.com",
    timeout: 5000, // 5 seconds
    headers: {
      "Authorization": "Bearer YOUR_TOKEN_HERE",
      "X-Custom-Header": "CustomValue",
    },
    validateStatus: (status) => status >= 200 && status < 500, // Accept 4xx errors
  };

  const api = new Network(config);

  try {
    const response = await api.get("/protected-resource");
    console.log("Response:", response);
  } catch (error) {
    console.error("Request failed:", error);
  }
}

// ============================================================================
// EXAMPLE 3: POST Request with Data
// ============================================================================
async function postExample() {
  const api = new Network("https://api.example.com");

  const newUser = {
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
  };

  try {
    const response = await api.post("/users", newUser);
    console.log("Created user:", response);
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error(`Failed to create user: ${error.message}`);
      console.error("Server response:", error.response);
    }
  }
}

// ============================================================================
// EXAMPLE 4: PUT and PATCH Requests
// ============================================================================
async function updateExamples() {
  const api = new Network("https://api.example.com");

  try {
    // PUT - Full update
    const fullUpdate = await api.put("/users/123", {
      name: "Jane Doe",
      email: "jane@example.com",
      role: "user",
      active: true,
    });
    console.log("Full update:", fullUpdate);

    // PATCH - Partial update
    const partialUpdate = await api.patch("/users/123", {
      active: false,
    });
    console.log("Partial update:", partialUpdate);
  } catch (error) {
    console.error("Update failed:", error);
  }
}

// ============================================================================
// EXAMPLE 5: DELETE Request
// ============================================================================
async function deleteExample() {
  const api = new Network("https://api.example.com");

  try {
    const response = await api.delete("/users/123");
    console.log("User deleted:", response);
  } catch (error) {
    if (error instanceof NetworkError) {
      if (error.status === 404) {
        console.log("User not found");
      } else {
        console.error("Delete failed:", error.message);
      }
    }
  }
}

// ============================================================================
// EXAMPLE 6: Custom Headers per Request
// ============================================================================
async function customHeadersPerRequest() {
  const api = new Network("https://api.example.com");

  try {
    const response = await api.get("/users", {
      headers: {
        "X-Request-ID": "unique-request-id-123",
        "Accept-Language": "en-US",
      },
    });
    console.log("Response with custom headers:", response);
  } catch (error) {
    console.error("Request failed:", error);
  }
}

// ============================================================================
// EXAMPLE 7: Request Timeout
// ============================================================================
async function timeoutExample() {
  const api = new Network("https://api.example.com");

  try {
    // This request will timeout after 1 second
    const response = await api.get("/slow-endpoint", {
      timeout: 1000,
    });
    console.log("Response:", response);
  } catch (error) {
    if (error instanceof NetworkError && error.status === 408) {
      console.log("Request timed out");
    }
  }
}

// ============================================================================
// EXAMPLE 8: Manual Abort Signal
// ============================================================================
async function abortExample() {
  const api = new Network("https://api.example.com");
  const controller = new AbortController();

  // Cancel request after 2 seconds
  setTimeout(() => controller.abort(), 2000);

  try {
    const response = await api.get("/users", {
      signal: controller.signal,
    });
    console.log("Response:", response);
  } catch (error) {
    if (error instanceof NetworkError && error.status === 408) {
      console.log("Request was aborted");
    }
  }
}

// ============================================================================
// EXAMPLE 9: Dynamic Header Management
// ============================================================================
async function dynamicHeaders() {
  const api = new Network("https://api.example.com");

  // Add authentication header after login
  const token = "obtained-after-login";
  api.setHeader("Authorization", `Bearer ${token}`);

  // Add custom header
  api.setHeader("X-Client-Version", "1.0.0");

  try {
    const response = await api.get("/profile");
    console.log("Profile:", response);

    // Remove header when logging out
    api.removeHeader("Authorization");
  } catch (error) {
    console.error("Request failed:", error);
  }
}

// ============================================================================
// EXAMPLE 10: Error Handling
// ============================================================================
async function errorHandlingExample() {
  const api = new Network("https://api.example.com");

  try {
    const response = await api.get("/non-existent");
    console.log("Response:", response);
  } catch (error) {
    if (error instanceof NetworkError) {
      console.log("Status:", error.status);
      console.log("Status Text:", error.statusText);
      console.log("Error Message:", error.message);
      console.log("Server Response:", error.response);

      // Handle specific status codes
      switch (error.status) {
        case 404:
          console.log("Resource not found");
          break;
        case 401:
          console.log("Unauthorized - please login");
          break;
        case 403:
          console.log("Forbidden - insufficient permissions");
          break;
        case 500:
          console.log("Server error - please try again later");
          break;
        default:
          console.log("An error occurred");
      }
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

// ============================================================================
// EXAMPLE 11: Using Full URLs (bypassing baseURL)
// ============================================================================
async function fullURLExample() {
  const api = new Network("https://api.example.com");

  try {
    // This will use the full URL, ignoring the baseURL
    const response = await api.get("https://another-api.com/data");
    console.log("Response from different API:", response);
  } catch (error) {
    console.error("Request failed:", error);
  }
}

// ============================================================================
// EXAMPLE 12: Chaining Multiple Requests
// ============================================================================
async function chainingRequests() {
  const api = new Network("https://api.example.com");

  try {
    // Get user
    const user = await api.get("/users/123");
    console.log("User:", user);

    // Update user based on retrieved data
    if (user && typeof user === "object" && "id" in user) {
      const updated = await api.patch(`/users/${user.id}`, {
        lastAccessed: new Date().toISOString(),
      });
      console.log("Updated user:", updated);
    }

    // Get user's posts
    const posts = await api.get("/users/123/posts");
    console.log("User posts:", posts);
  } catch (error) {
    console.error("Request chain failed:", error);
  }
}

// ============================================================================
// EXAMPLE 13: Using HEAD and OPTIONS Requests
// ============================================================================
async function headAndOptionsExample() {
  const api = new Network("https://api.example.com");

  try {
    // HEAD request - check if resource exists without downloading body
    const headResponse = await api.head("/users/123");
    console.log("Resource exists:", headResponse);

    // OPTIONS request - check available methods
    const optionsResponse = await api.options("/users");
    console.log("Available methods:", optionsResponse);
  } catch (error) {
    console.error("Request failed:", error);
  }
}

// ============================================================================
// EXAMPLE 14: Real-world Authentication Flow
// ============================================================================
async function authenticationFlow() {
  const api = new Network({
    baseURL: "https://api.example.com",
    timeout: 10000,
  });

  try {
    // 1. Login
    const loginResponse = await api.post("/auth/login", {
      username: "user@example.com",
      password: "secure-password",
    });

    if (
      loginResponse &&
      typeof loginResponse === "object" &&
      "token" in loginResponse
    ) {
      const token = loginResponse.token;

      // 2. Set token for future requests
      api.setHeader("Authorization", `Bearer ${token}`);

      // 3. Fetch protected data
      const userData = await api.get("/user/profile");
      console.log("User profile:", userData);

      // 4. Update profile
      const updatedProfile = await api.patch("/user/profile", {
        displayName: "New Display Name",
      });
      console.log("Updated profile:", updatedProfile);

      // 5. Logout
      await api.post("/auth/logout", {});
      api.removeHeader("Authorization");
      console.log("Logged out successfully");
    }
  } catch (error) {
    if (error instanceof NetworkError) {
      if (error.status === 401) {
        console.error("Authentication failed");
      } else {
        console.error("Request failed:", error.message);
      }
    }
  }
}

// Export examples for use in other files
export {
  basicUsage,
  advancedConfiguration,
  postExample,
  updateExamples,
  deleteExample,
  customHeadersPerRequest,
  timeoutExample,
  abortExample,
  dynamicHeaders,
  errorHandlingExample,
  fullURLExample,
  chainingRequests,
  headAndOptionsExample,
  authenticationFlow,
};
