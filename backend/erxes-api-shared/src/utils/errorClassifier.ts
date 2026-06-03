/**
 * Error Classification System
 * 
 * Intercepts thrown errors and classifies them as:
 * - EXPECTED: Business logic errors (not found, validation, auth) — skip Sentry, return HTTP 200
 * - SYSTEM: Infrastructure/bug errors (database, network, memory) — capture in Sentry, HTTP 500
 * - PROVIDER: External service failures (API timeouts, payment failures) — capture in Sentry with context
 * - UNKNOWN: Default to SYSTEM for safety
 */

import * as Sentry from '@sentry/node';

export type ErrorCategory = 'EXPECTED' | 'SYSTEM' | 'PROVIDER' | 'UNKNOWN';

export interface IClassificationResult {
  category: ErrorCategory;
  statusCode: number;
  isExpected: boolean;
}

// Expected error patterns — business logic conditions
const EXPECTED_PATTERNS: RegExp[] = [
  /not found/i,
  /not exists/i,
  /does not exist/i,
  /already exists/i,
  /already in use/i,
  /already taken/i,
  /already active/i,
  /is required/i,
  /are required/i,
  /must be provided/i,
  /cannot be empty/i,
  /invalid/i,
  /not valid/i,
  /is not valid/i,
  /wrong password/i,
  /incorrect password/i,
  /permission denied/i,
  /not allowed/i,
  /not permitted/i,
  /not authorized/i,
  /not authenticated/i,
  /unauthorized/i,
  /forbidden/i,
  /insufficient/i,
  /mismatch/i,
  /too many/i,
  /out of range/i,
  /missing/i,
  /not configured/i,
  /not set/i,
  /unsupported/i,
  /bad request/i,
  /please enter/i,
  /please provide/i,
  /no such/i,
  /cannot find/i,
  /doesn't exist/i,
  /could not find/i,
  /was not found/i,
  /has been deleted/i,
  /has been removed/i,
  /is inactive/i,
  /is disabled/i,
  /is locked/i,
  /expired/i,
  /not found in/i,
  /no .+ found/i,
  /duplicate/i,
  /unique constraint/i,
  /schema validation/i,
];

// System error patterns — infrastructure/bugs
// These are checked BEFORE expected patterns to prevent shadowing
const SYSTEM_PATTERNS: RegExp[] = [
  /MongoNetworkError/i,
  /MongoServerError/i,
  /BSONError/i,
  /Cast to ObjectId failed/i,
  /Cast to .* failed for value/i,
  /Mongoose.*validation failed/i,
  /validation failed.*(BSON|ObjectId|Cast|type string)/i,
  /connection.*closed/i,
  /socket hang up/i,
  /unexpected token/i,
  /syntax error/i,
  /undefined is not/i,
  /Cannot read property/i,
  /Cannot read properties/i,
  /null pointer/i,
  /out of memory/i,
  /ENOMEM/i,
  /worker.*failed/i,
  /queue.*failed/i,
  /bullmq/i,
  /redis.*error/i,
  /elasticsearch.*error/i,
  /rabbitmq.*error/i,
  /environment variable/i,
  /env var/i,
  /cannot find module/i,
  /EACCES/i,
  /EPERM/i,
  /RangeError/i,
  /TypeError/i,
  /ReferenceError/i,
  /internal server error/i,
  /unhandled rejection/i,
  /uncaught exception/i,
];

// Provider error patterns — external service failures
const PROVIDER_PATTERNS: RegExp[] = [
  /failed to (get|post|fetch|send|create|update|delete)/i,
  /request failed/i,
  /connection refused/i,
  /timeout/i,
  /ENOTFOUND/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /ECONNRESET/i,
  /EPIPE/i,
  /payment failed/i,
  /service unavailable/i,
  /bad gateway/i,
  /rate limit/i,
  /too many requests/i,
  /upstream/i,
  /provider.*error/i,
  /external.*error/i,
  /api.*error/i,
  /webhook.*failed/i,
];

/**
 * Classify an error by its message and optional code
 */
export function classifyError(error: unknown): IClassificationResult {
  const message = extractMessage(error);
  const code = extractCode(error);
  const errorName = extractErrorName(error);

  // Check explicit error codes first
  if (code) {
    const codeCategory = classifyByCode(code);
    if (codeCategory) {
      return {
        category: codeCategory,
        statusCode: getStatusCode(codeCategory),
        isExpected: codeCategory === 'EXPECTED',
      };
    }
  }

  // Check for Mongoose/database validation errors (SYSTEM) before generic patterns
  // These often contain "validation failed" but are infrastructure errors
  if (isMongooseValidationError(errorName, message)) {
    return { category: 'SYSTEM', statusCode: 500, isExpected: false };
  }

  // Check SYSTEM patterns first to prevent EXPECTED patterns from shadowing
  // system errors (e.g., "Cannot find module" should be SYSTEM, not EXPECTED)
  if (matchesAny(message, SYSTEM_PATTERNS) || matchesAny(errorName, SYSTEM_PATTERNS)) {
    return { category: 'SYSTEM', statusCode: 500, isExpected: false };
  }

  if (matchesAny(message, EXPECTED_PATTERNS)) {
    return { category: 'EXPECTED', statusCode: 200, isExpected: true };
  }

  if (matchesAny(message, PROVIDER_PATTERNS)) {
    return { category: 'PROVIDER', statusCode: 502, isExpected: false };
  }

  // Default: if it looks like a structured business error, treat as expected
  if (looksLikeBusinessError(error)) {
    return { category: 'EXPECTED', statusCode: 200, isExpected: true };
  }

  return { category: 'UNKNOWN', statusCode: 500, isExpected: false };
}

/**
 * Quick check if error is expected (for guard clauses)
 */
export function isExpectedError(error: unknown): boolean {
  return classifyError(error).isExpected;
}

/**
 * Extract human-readable message from any error type
 */
export function extractMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }
  return String(error);
}

/**
 * Extract error name/constructor if present
 */
function extractErrorName(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.name;
  }
  if (error && typeof error === 'object') {
    if ('name' in error && typeof error.name === 'string') {
      return error.name;
    }
  }
  return undefined;
}

/**
 * Check if this is a Mongoose/database validation error (SYSTEM)
 * vs a business validation error (EXPECTED)
 */
function isMongooseValidationError(name: string | undefined, message: string): boolean {
  if (!name || !message) return false;

  // Mongoose ValidationError with database issues
  if (name === 'ValidationError') {
    // If it mentions BSON, ObjectId casting, or database paths, it's a system error
    if (/BSONError|Cast to ObjectId|Cast to .* failed|path "|type string/i.test(message)) {
      return true;
    }
  }

  return false;
}

/**
 * Extract error code if present
 */
function extractCode(error: unknown): string | undefined {
  if (error && typeof error === 'object') {
    if ('code' in error && typeof error.code === 'string') {
      return error.code;
    }
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return String(error.statusCode);
    }
  }
  return undefined;
}

/**
 * Classify by explicit error code
 */
function classifyByCode(code: string): ErrorCategory | undefined {
  const expectedCodes = [
    'ENOT_FOUND', 'NOT_FOUND', 'EEXIST', 'VALIDATION_ERROR',
    'UNAUTHORIZED', 'FORBIDDEN', 'PERMISSION_DENIED', 'BAD_REQUEST',
    'CONFLICT', 'DUPLICATE', 'REQUIRED', 'INVALID',
  ];
  
  const providerCodes = [
    'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET',
    'EPIPE', 'EHOSTUNREACH', 'ECONNABORTED',
  ];

  const systemCodes = [
    'ENOMEM', 'EACCES', 'EPERM',
  ];

  if (expectedCodes.includes(code)) return 'EXPECTED';
  if (providerCodes.includes(code)) return 'PROVIDER';
  if (systemCodes.includes(code)) return 'SYSTEM';
  
  return undefined;
}

/**
 * Get HTTP status code for category
 */
function getStatusCode(category: ErrorCategory): number {
  switch (category) {
    case 'EXPECTED': return 200;
    case 'SYSTEM': return 500;
    case 'PROVIDER': return 502;
    case 'UNKNOWN': return 500;
  }
}

/**
 * Check if message matches any pattern
 */
function matchesAny(text: string | undefined, patterns: RegExp[]): boolean {
  if (!text) return false;
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Heuristic: does this look like a business logic error?
 * Business errors are typically short, human-readable, and lack stack traces
 */
function looksLikeBusinessError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  // Business errors usually have short messages
  if (error.message.length > 200) return false;
  
  // Business errors usually lack stack traces or have shallow ones
  if (!error.stack) return true;
  
  // If stack trace is very short, likely a constructed error
  const stackLines = error.stack.split('\n').length;
  if (stackLines <= 3) return true;
  
  return false;
}

/**
 * Shared Sentry beforeSend filter that drops expected business errors.
 * Use this in all Sentry.init() calls to keep filtering consistent.
 */
export function sentryExpectedErrorFilter(
  event: Sentry.ErrorEvent,
  _hint?: Sentry.EventHint,
): Sentry.ErrorEvent | null {
  const error = event.exception?.values?.[0];
  if (error?.value) {
    const classification = classifyError(error.value);
    if (classification.category === 'EXPECTED') {
      // Drop the event — it's an expected business error
      return null;
    }
  }
  return event;
}
