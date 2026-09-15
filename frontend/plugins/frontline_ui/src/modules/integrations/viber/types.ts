export interface ViberIntegration {
  _id: string;
  name: string;
  brandId?: string;
  channelId: string;
  isActive: boolean;
  healthStatus?: unknown;
}

export interface ViberSetup {
  webhookUrl: string | null;
  webhookError: string | null;
  mediaHostnames: string[];
  mediaError: string | null;
  storageProvider: string | null;
  storageError: string | null;
}

export interface ViberConnection {
  integrationId: string;
  botId: string;
  name: string | null;
  healthStatus: string;
  error: string | null;
  webhookUrl: string | null;
}

export interface ViberDelivery {
  _id: string;
  state: string;
  error?: string | null;
  parts: {
    index: number;
    type: string;
    state: string;
    error?: string | null;
    deliveredAt?: string | null;
    seenAt?: string | null;
    failedAt?: string | null;
  }[];
}

export interface ViberAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ViberReply {
  conversationId: string;
  content?: string;
  attachments?: ViberAttachment[];
  message?: Record<string, unknown>;
}
