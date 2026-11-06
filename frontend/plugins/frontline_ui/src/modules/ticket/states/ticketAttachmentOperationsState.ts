import { atom, type PrimitiveAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import type { IAttachment } from '@/ticket/types/attachments';

type TTicketAttachmentOperation = {
  attachments: IAttachment[];
  source: IAttachment[];
  busy: boolean;
};

export const ticketAttachmentOperationsState = atomFamily<
  string,
  PrimitiveAtom<TTicketAttachmentOperation | undefined>
>(() => atom<TTicketAttachmentOperation | undefined>());
