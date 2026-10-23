import type { AttachmentInput } from '~/gql/graphql';

type AttachmentSource = {
  url?: string | null;
  name?: string | null;
  type?: string | null;
  size?: number | null;
  duration?: number | null;
};

export const toAttachmentInput = (
  attachment?: AttachmentSource | null,
): AttachmentInput | undefined =>
  attachment?.url
    ? {
        url: attachment.url,
        name: attachment.name || '',
        type: attachment.type,
        size: attachment.size,
        duration: attachment.duration,
      }
    : undefined;

export const toAttachmentFormValue = (attachment?: AttachmentSource | null) =>
  attachment?.url
    ? {
        url: attachment.url,
        name: attachment.name || '',
        type: attachment.type || '',
        size: attachment.size || 0,
      }
    : null;
