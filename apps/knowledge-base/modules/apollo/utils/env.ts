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

const missingKeys = (required: [key: string, value: string][]): string[] =>
  required.filter(([, value]) => !value).map(([key]) => key);

export const missingKbEnvKeys = (env: PortalEnv): string[] =>
  missingKeys([
    ['NEXT_PUBLIC_ERXES_API_URL', env.apiUrl],
    ['NEXT_PUBLIC_ERXES_KB_TOPIC_ID', env.topicId],
  ]);

export const missingCmsEnvKeys = (env: PortalEnv): string[] =>
  missingKeys([
    ['NEXT_PUBLIC_ERXES_API_URL', env.apiUrl],
    ['NEXT_PUBLIC_ERXES_CP_TOKEN', env.appToken],
  ]);

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

export const missingFormEnvKeys = (env: PortalEnv, form: FormEnv): string[] =>
  missingKeys([
    ['NEXT_PUBLIC_ERXES_API_URL', env.apiUrl],
    ['NEXT_PUBLIC_ERXES_CP_TOKEN', env.appToken],
    ['NEXT_PUBLIC_ERXES_FORM_CHANNEL_ID', form.channelId],
    ['NEXT_PUBLIC_ERXES_FORM_TAG_ID', form.tagId],
  ]);

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

export const missingTicketEnvKeys = (env: TicketEnv): string[] =>
  missingKeys([
    ['NEXT_PUBLIC_ERXES_TICKET_PIPELINE_ID', env.pipelineId],
    ['NEXT_PUBLIC_ERXES_TICKET_CHANNEL_ID', env.channelId],
    ['NEXT_PUBLIC_ERXES_TICKET_STATUS_ID', env.statusId],
  ]);
