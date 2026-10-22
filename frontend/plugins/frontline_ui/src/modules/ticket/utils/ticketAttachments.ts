import { compactList } from '@/shared/utils/cursorList';
import type { IAttachment } from '@/ticket/types/attachments';
import type { ITicketDetail } from '@/ticket/types';
import type { AttachmentInput } from '~/gql/graphql';

/** Stored attachments may lack `name`, `type` or `size`; the uploader needs all three. */
export const toTicketAttachments = (
  attachments: ITicketDetail['attachments'],
): IAttachment[] =>
  compactList(attachments).map(({ url, name, type, size, duration }) => ({
    url,
    name: name ?? '',
    type: type ?? '',
    size: size ?? 0,
    duration: duration ?? undefined,
  }));

/** Picks the `AttachmentInput` fields, so no `__typename` reaches the API. */
export const toAttachmentInput = ({
  url,
  name,
  type,
  size,
  duration,
}: IAttachment): AttachmentInput => ({ url, name, type, size, duration });
