import { ExpectedError } from 'erxes-api-shared/utils';

export const LOGIN_FAILED = 'LOGIN_FAILED';

export type LoginFailureReason =
  | 'invalid_credentials'
  | 'rate_limited'
  | 'directory_locked'
  | 'directory_password_expired'
  | 'directory_disabled'
  | 'directory_unreachable'
  | 'not_allowed'
  | 'not_linked'
  | 'two_factor_required'
  | 'two_factor_setup_required'
  | 'two_factor_invalid'
  | 'two_factor_expired';

// English text is what admins read in login logs; the UI translates by reason
const MESSAGES: Record<LoginFailureReason, string> = {
  invalid_credentials: 'Invalid login',
  rate_limited: 'Too many login attempts. Please try again later.',
  directory_locked: 'Invalid login: directory account is locked',
  directory_password_expired: 'Invalid login: directory password has expired',
  directory_disabled: 'Invalid login: account is disabled',
  directory_unreachable: 'Directory server did not respond',
  not_allowed: 'Invalid login: not in an allowed directory group',
  not_linked: 'Invalid login: account is not linked to the directory',
  two_factor_required: 'Two-factor code required',
  two_factor_setup_required: 'Two-factor setup required',
  two_factor_invalid: 'Invalid two-factor code',
  two_factor_expired: 'Sign-in expired, please sign in again',
};

export class LoginError extends ExpectedError {
  readonly extensions: {
    code: string;
    reason: LoginFailureReason;
    challenge?: string;
  };

  // challenge: the two-factor step's token, carried back to the sign-in form
  constructor(readonly reason: LoginFailureReason, challenge?: string) {
    super(MESSAGES[reason], LOGIN_FAILED);
    this.extensions = {
      code: LOGIN_FAILED,
      reason,
      ...(challenge ? { challenge } : {}),
    };
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
