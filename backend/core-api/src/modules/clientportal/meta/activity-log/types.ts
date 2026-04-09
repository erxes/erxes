type CPUserLoginMethod = 'credentials' | 'otp' | 'social';

export interface CPUserLoginActivityPayload {
  activityType: string;
  target: { _id: string };
  action: { type: string; description: string };
  changes: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export type { CPUserLoginMethod };
