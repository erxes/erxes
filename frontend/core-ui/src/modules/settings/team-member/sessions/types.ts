export type TSessionState = 'active' | 'idle' | 'none';

export interface IUserSession {
  _id: string;
  method: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  userAgent?: string | null;
  current: boolean;
}
