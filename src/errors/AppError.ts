// 1. Centralized Error Codes Dictionary
const ErrorCodes = {
  // Browser Errors
  BROWSER_NOT_SET: "BROWSER_NOT_SET",

  // System Errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

type ErrorCodeValue = (typeof ErrorCodes)[keyof typeof ErrorCodes];

class AppError extends Error {
  public code: ErrorCodeValue;
  public statusCode: number;

  constructor(code: ErrorCodeValue, message: string, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode; // Maps easily to HTTP status codes

    // Captures the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
