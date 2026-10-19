import type { IResponseTemplate } from '@/responseTemplate/types';

/** Template pickers insert `content` and list `name`; both may be null in the schema. */
export const toResponseTemplateText = (response: IResponseTemplate) => ({
  ...response,
  name: response.name ?? '',
  content: response.content ?? '',
  channelId: response.channelId ?? undefined,
  createdAt: response.createdAt ?? undefined,
  updatedAt: response.updatedAt ?? undefined,
});
