const VALIDATION_MESSAGES = {
   REQUIRED_FIELD: "This field is required",
   INVALID_EMAIL: "Please provide a valid email address",
   INVALID_PASSWORD: "Password must be at least 8 characters long",
   INVALID_PLATFORM: "Platform must be one of: web, mobile, desktop",
   INVALID_REDIRECT_URL: "Invalid redirect URL",
   INVALID_STATE: "Invalid authentication state",
   STATE_EXPIRED: "Authentication state expired",
   PLATFORM_MISMATCH: "Platform mismatch"
};

const ERROR_MESSAGES = {
   DATABASE_ERROR: "Database error occurred",
   UNAUTHORIZED: "Unauthorized access",
   FORBIDDEN: "Access forbidden",
   NOT_FOUND: "Resource not found",
   BAD_REQUEST: "Bad request",
   VALIDATION_ERROR: "Validation error",
   RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
   METHOD_NOT_ALLOWED: "Method not allowed",
   CONFLICT: "Resource conflict",
   UNPROCESSABLE_ENTITY: "Unprocessable entity",
   TOO_MANY_REQUESTS: "Too many requests",
   INTERNAL_SERVER_ERROR: "Internal server error",
   SERVICE_UNAVAILABLE: "Service temporarily unavailable"
};

const SUCCESS_MESSAGES = {
   OPERATION_SUCCESS: "Operation completed successfully",
   DATA_RETRIEVED: "Data retrieved successfully",
   DATA_CREATED: "Data created successfully",
   DATA_UPDATED: "Data updated successfully",
   DATA_DELETED: "Data deleted successfully"
};

export const ResponseMessages = {
   VALIDATION: VALIDATION_MESSAGES,
   ERROR: ERROR_MESSAGES,
   SUCCESS: SUCCESS_MESSAGES
} as const;
