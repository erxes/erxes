import { type IAttachment } from 'erxes-ui';

export const attachmentKey = (attachment: IAttachment, index: number) =>
  `${attachment.url || 'missing'}-${index}`;
