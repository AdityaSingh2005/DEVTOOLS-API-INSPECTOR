import type { APICall } from "./types"

export const mockAPIData: APICall[] = [
  {
    id: "1",
    url: "https://api.example.com/v1/users?page=1&limit=10",
    method: "GET",
    status: 200,
    duration: 156,
    timestamp: Date.now() - 5000,
    requestHeaders: {
      "Content-Type": "application/json",
      Authorization: "Bearer eyJhbGciOiJIUzI1...",
      Accept: "application/json",
      "User-Agent": "Chrome/120.0.0.0",
    },
    responseHeaders: {
      "Content-Type": "application/json",
      "X-Request-ID": "abc123",
      "Cache-Control": "no-cache",
    },
    requestBody: {},
    responseBody: {
      users: [
        { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
        { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "user" },
      ],
      pagination: { page: 1, limit: 10, total: 45 },
    },
    requestSize: 128,
    responseSize: 2048,
    contentType: "application/json",
    initiator: `at fetchUsers (users.js:45:12)
at UserList.componentDidMount (UserList.jsx:23:8)
at commitLifeCycles (react-dom.js:17894:22)`,
  },
  {
    id: "2",
    url: "https://api.example.com/v1/users",
    method: "POST",
    status: 201,
    duration: 234,
    timestamp: Date.now() - 15000,
    requestHeaders: {
      "Content-Type": "application/json",
      Authorization: "Bearer eyJhbGciOiJIUzI1...",
    },
    responseHeaders: {
      "Content-Type": "application/json",
      Location: "/v1/users/4",
    },
    requestBody: {
      name: "Alice Brown",
      email: "alice@example.com",
      role: "user",
    },
    responseBody: {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      role: "user",
      createdAt: "2024-01-15T10:30:00Z",
    },
    requestSize: 256,
    responseSize: 512,
    contentType: "application/json",
  },
  {
    id: "3",
    url: "https://api.example.com/v1/products/123",
    method: "GET",
    status: 404,
    duration: 89,
    timestamp: Date.now() - 30000,
    requestHeaders: {
      Accept: "application/json",
    },
    responseHeaders: {
      "Content-Type": "application/json",
    },
    requestBody: {},
    responseBody: {
      error: "Not Found",
      message: "Product with ID 123 does not exist",
      statusCode: 404,
    },
    requestSize: 64,
    responseSize: 128,
    contentType: "application/json",
  },
  {
    id: "4",
    url: "https://api.example.com/v1/upload/avatar",
    method: "POST",
    status: 200,
    duration: 1234,
    timestamp: Date.now() - 45000,
    requestHeaders: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer eyJhbGciOiJIUzI1...",
    },
    responseHeaders: {
      "Content-Type": "image/png",
    },
    requestBody: {},
    responseBody: {},
    requestSize: 102400,
    responseSize: 51200,
    contentType: "image/png",
    responseType: "image",
    previewData: {
      url: "/user-avatar-profile.png",
      metadata: {
        dimensions: "400 × 400",
        mimeType: "image/png",
        size: "50 KB",
      },
    },
  },
  {
    id: "5",
    url: "https://api.example.com/v1/reports/quarterly",
    method: "GET",
    status: 200,
    duration: 567,
    timestamp: Date.now() - 60000,
    requestHeaders: {
      Accept: "application/pdf",
      Authorization: "Bearer eyJhbGciOiJIUzI1...",
    },
    responseHeaders: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=Q4-Report.pdf",
    },
    requestBody: {},
    responseBody: {},
    requestSize: 64,
    responseSize: 1048576,
    contentType: "application/pdf",
    responseType: "pdf",
    previewData: {
      url: "/quarterly-business-report-pdf-document.jpg",
      pageCount: 12,
    },
  },
  {
    id: "6",
    url: "https://api.example.com/v1/auth/login",
    method: "POST",
    status: 500,
    duration: 2345,
    timestamp: Date.now() - 90000,
    requestHeaders: {
      "Content-Type": "application/json",
    },
    responseHeaders: {
      "Content-Type": "application/json",
    },
    requestBody: {
      email: "user@example.com",
      password: "********",
    },
    responseBody: {
      error: "Internal Server Error",
      message: "Database connection timeout",
      statusCode: 500,
      trace: "ConnectionError: Unable to connect to database server",
    },
    requestSize: 128,
    responseSize: 256,
    contentType: "application/json",
  },
  {
    id: "7",
    url: "https://api.example.com/v1/users?page=1&limit=10",
    method: "GET",
    status: 200,
    duration: 178,
    timestamp: Date.now() - 120000,
    requestHeaders: {
      "Content-Type": "application/json",
      Authorization: "Bearer eyJhbGciOiJIUzI1...",
    },
    responseHeaders: {
      "Content-Type": "application/json",
    },
    requestBody: {},
    responseBody: {
      users: [
        { id: 1, name: "John Doe", email: "john@example.com", role: "user" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "admin" },
      ],
      pagination: { page: 1, limit: 10, total: 42 },
    },
    requestSize: 128,
    responseSize: 1536,
    contentType: "application/json",
  },
  {
    id: "8",
    url: "https://api.example.com/v1/templates/email",
    method: "GET",
    status: 200,
    duration: 234,
    timestamp: Date.now() - 150000,
    requestHeaders: {
      Accept: "text/html",
    },
    responseHeaders: {
      "Content-Type": "text/html",
    },
    requestBody: {},
    responseBody: {},
    requestSize: 64,
    responseSize: 4096,
    contentType: "text/html",
    responseType: "html",
    previewData: {
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Email Template</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome!</h1>
  </div>
  <div class="content">
    <h2>Hello, {{name}}!</h2>
    <p>Thank you for signing up. We're excited to have you on board.</p>
    <p>Click the button below to get started:</p>
    <a href="#" class="button">Get Started</a>
  </div>
</body>
</html>`,
    },
  },
  {
    id: "9",
    url: "https://api.example.com/v1/settings",
    method: "PUT",
    status: 200,
    duration: 145,
    timestamp: Date.now() - 180000,
    requestHeaders: {
      "Content-Type": "application/json",
      Authorization: "Bearer eyJhbGciOiJIUzI1...",
    },
    responseHeaders: {
      "Content-Type": "application/json",
    },
    requestBody: {
      theme: "dark",
      notifications: true,
      language: "en",
    },
    responseBody: {
      success: true,
      settings: {
        theme: "dark",
        notifications: true,
        language: "en",
        updatedAt: "2024-01-15T11:00:00Z",
      },
    },
    requestSize: 128,
    responseSize: 256,
    contentType: "application/json",
  },
  {
    id: "10",
    url: "https://api.example.com/v1/data/export",
    method: "GET",
    status: 200,
    duration: 890,
    timestamp: Date.now() - 200000,
    requestHeaders: {
      Accept: "application/octet-stream",
      Authorization: "Bearer eyJhbGciOiJIUzI1...",
    },
    responseHeaders: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": "attachment; filename=export.bin",
    },
    requestBody: {},
    responseBody: {},
    requestSize: 64,
    responseSize: 524288,
    contentType: "application/octet-stream",
    responseType: "binary",
  },
  {
    id: "11",
    url: "https://api.example.com/v1/users/1",
    method: "DELETE",
    status: 204,
    duration: 98,
    timestamp: Date.now() - 220000,
    requestHeaders: {
      Authorization: "Bearer eyJhbGciOiJIUzI1...",
    },
    responseHeaders: {},
    requestBody: {},
    responseBody: {},
    requestSize: 64,
    responseSize: 0,
    contentType: "application/json",
  },
  {
    id: "12",
    url: "https://api.example.com/v1/orders",
    method: "GET",
    status: 301,
    duration: 45,
    timestamp: Date.now() - 250000,
    requestHeaders: {
      Accept: "application/json",
    },
    responseHeaders: {
      Location: "https://api.example.com/v2/orders",
    },
    requestBody: {},
    responseBody: {
      message: "Moved Permanently",
      newLocation: "https://api.example.com/v2/orders",
    },
    requestSize: 64,
    responseSize: 128,
    contentType: "application/json",
  },
]
