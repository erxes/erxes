import {
  ALL_CP_USER_LEVEL_REQUIREMENT_ERROR_MESSAGES,
  CpUserLevels
} from './consts';

const CUSTOM_ERROR_TYPES = [
  'INSUFFICIENT_USER_LEVEL',
  'INSUFFICIENT_PERMISSION'
] as const;
export type CustomErrorType = typeof CUSTOM_ERROR_TYPES[number];

class BaseCustomError extends Error {
  public type: CustomErrorType;

  constructor(message: string, type: CustomErrorType) {
    super(message);
    this.type = type;
  }
}

export class InsufficientUserLevelError extends BaseCustomError {
  public requiredLevel: CpUserLevels;

  constructor(message: string, requiredLevel: CpUserLevels) {
    super(message, 'INSUFFICIENT_USER_LEVEL');
    this.requiredLevel = requiredLevel;
  }
}

export class InsufficientPermissionError extends BaseCustomError {
  constructor() {
    super('Insufficient user permission', 'INSUFFICIENT_PERMISSION');
  }
}

export class LoginRequiredError extends InsufficientUserLevelError {
  constructor() {
    super(
      ALL_CP_USER_LEVEL_REQUIREMENT_ERROR_MESSAGES.REGISTERED,
      'REGISTERED'
    );
  }
}
