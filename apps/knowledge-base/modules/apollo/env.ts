/**
 * Runtime configuration for the erxes gateway.
 *
 * The knowledge base and the CMS have different requirements:
 * `cpKnowledgeBaseTopicDetail` skips the permission check and needs only the
 * gateway URL and a topic id, while every CMS `cp*` query resolves its client
 * portal from the app token and fails with "Client portal required" without it.
 */
export type PortalEnv = {
  apiUrl: string;
  appToken: string;
  topicId: string;
};

export const readPortalEnv = (): PortalEnv => ({
  apiUrl: process.env.NEXT_PUBLIC_ERXES_API_URL ?? '',
  appToken: process.env.NEXT_PUBLIC_ERXES_CP_TOKEN ?? '',
  topicId: process.env.NEXT_PUBLIC_ERXES_KB_TOPIC_ID ?? '',
});

export const missingKbEnvKeys = (env: PortalEnv): string[] => {
  const missing: string[] = [];

  if (!env.apiUrl) {
    missing.push('NEXT_PUBLIC_ERXES_API_URL');
  }

  if (!env.topicId) {
    missing.push('NEXT_PUBLIC_ERXES_KB_TOPIC_ID');
  }

  return missing;
};

export const missingCmsEnvKeys = (env: PortalEnv): string[] => {
  const missing: string[] = [];

  if (!env.apiUrl) {
    missing.push('NEXT_PUBLIC_ERXES_API_URL');
  }

  if (!env.appToken) {
    missing.push('NEXT_PUBLIC_ERXES_CP_TOKEN');
  }

  return missing;
};

/** Extra configuration the ticket surfaces need on top of `PortalEnv`. */
export type TicketEnv = {
  pipelineId: string;
  channelId: string;
  statusId: string;
};

export const readTicketEnv = (): TicketEnv => ({
  pipelineId: process.env.NEXT_PUBLIC_ERXES_TICKET_PIPELINE_ID ?? '',
  channelId: process.env.NEXT_PUBLIC_ERXES_TICKET_CHANNEL_ID ?? '',
  statusId: process.env.NEXT_PUBLIC_ERXES_TICKET_STATUS_ID ?? '',
});

export const missingTicketEnvKeys = (env: TicketEnv): string[] => {
  const missing: string[] = [];

  if (!env.pipelineId) {
    missing.push('NEXT_PUBLIC_ERXES_TICKET_PIPELINE_ID');
  }

  if (!env.channelId) {
    missing.push('NEXT_PUBLIC_ERXES_TICKET_CHANNEL_ID');
  }

  if (!env.statusId) {
    missing.push('NEXT_PUBLIC_ERXES_TICKET_STATUS_ID');
  }

  return missing;
};
