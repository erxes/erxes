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
  | 'not_linked';

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
};

export class LoginError extends ExpectedError {
  readonly extensions: { code: string; reason: LoginFailureReason };

  constructor(readonly reason: LoginFailureReason) {
    super(MESSAGES[reason], LOGIN_FAILED);
    this.extensions = { code: LOGIN_FAILED, reason };
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
