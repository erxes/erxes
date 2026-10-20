import { IKbAttachment } from '@/knowledgebase/types';
import type { FrontlineKbAttachmentFieldsFragment } from '~/gql/graphql';

export const toKbAttachment = (
  attachment: FrontlineKbAttachmentFieldsFragment,
): IKbAttachment => ({
  url: attachment.url,
  name: attachment.name ?? '',
  type: attachment.type ?? undefined,
  size: attachment.size ?? undefined,
  duration: attachment.duration ?? undefined,
});
