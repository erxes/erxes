export interface ITelegramWebhook {
  url: string;
  hasCustomCertificate: boolean;
  pendingUpdateCount: number;
  ipAddress?: string;
  lastErrorDate?: Date;
  lastErrorMessage?: string;
  lastSynchronizationErrorDate?: Date;
  maxConnections?: number;
  allowedUpdates?: string[];
}
