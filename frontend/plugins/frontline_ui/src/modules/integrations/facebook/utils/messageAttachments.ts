import type { IAttachment } from 'erxes-ui';

export const normalizeFacebookAttachments = (
  attachments?: IAttachment[],
): IAttachment[] | undefined => {
  if (!attachments) return attachments;

  const byUrl = new Map<string, IAttachment>();
  const withoutUrl: IAttachment[] = [];
  for (const attachment of attachments) {
    if (!attachment.url) {
      withoutUrl.push(attachment);
      continue;
    }
    const previous = byUrl.get(attachment.url);
    if (!previous || attachment.type === 'sticker') {
      byUrl.set(attachment.url, attachment);
    }
  }
  return [...byUrl.values(), ...withoutUrl];
};
