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

export type FormEnv = {
  channelId: string;
  tagId: string;
};

/**
 * Frontline forms are read per channel, and `cpForms` throws without one. The
 * tag is what marks a form as belonging in this portal: erxes exposes a
 * `tagId` argument but ignores it, so the portal filters on `tagIds` itself.
 */
export const readFormEnv = (): FormEnv => ({
  channelId:
    process.env.NEXT_PUBLIC_ERXES_FORM_CHANNEL_ID ||
    process.env.NEXT_PUBLIC_ERXES_TICKET_CHANNEL_ID ||
    '',
  tagId: process.env.NEXT_PUBLIC_ERXES_FORM_TAG_ID ?? '',
});

export const missingFormEnvKeys = (env: PortalEnv, form: FormEnv): string[] => {
  const missing: string[] = [];

  if (!env.apiUrl) {
    missing.push('NEXT_PUBLIC_ERXES_API_URL');
  }

  if (!env.appToken) {
    missing.push('NEXT_PUBLIC_ERXES_CP_TOKEN');
  }

  if (!form.channelId) {
    missing.push('NEXT_PUBLIC_ERXES_FORM_CHANNEL_ID');
  }

  if (!form.tagId) {
    missing.push('NEXT_PUBLIC_ERXES_FORM_TAG_ID');
  }

  return missing;
};

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
