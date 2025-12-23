class BaseError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string) {
    super('AuthenticationError', message);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super('ValidationError', message);
  }
}

export class RateLimitError extends BaseError {
  constructor(
    message: string = 'Rate limit exceeded. Please try again later.',
  ) {
    super('RateLimitError', message);
  }
}

export class AccountLockedError extends BaseError {
  constructor(
    message: string = 'Account is temporarily locked. Please try again later.',
  ) {
    super('AccountLockedError', message);
  }
}

export class TokenExpiredError extends BaseError {
  constructor(message: string = 'Token has expired') {
    super('TokenExpiredError', message);
  }
}

export class NetworkError extends BaseError {
  constructor(message: string = 'Network error occurred. Please try again.') {
    super('NetworkError', message);
  }
}

export function handleAuthError(error: Error): Error {
  const msg = error.message.toLowerCase();

  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return new AuthenticationError('Invalid email, phone, or password');
  }
  if (msg.includes('not verified') || msg.includes('verification required')) {
    return new AuthenticationError(
      'Please verify your email before logging in',
    );
  }
  if (msg.includes('expired')) {
    return new TokenExpiredError(
      'Your session has expired. Please log in again.',
    );
  }
  if (msg.includes('limit') || msg.includes('rate')) {
    return new RateLimitError();
  }
  if (msg.includes('locked')) {
    return new AccountLockedError();
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return new NetworkError();
  }

  return new Error(error.message);
}

export function isNetworkError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    error.name === 'NetworkError' ||
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout')
  );
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (!isNetworkError(lastError) || attempt === maxRetries) {
        throw lastError;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError!;
}
