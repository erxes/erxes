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
