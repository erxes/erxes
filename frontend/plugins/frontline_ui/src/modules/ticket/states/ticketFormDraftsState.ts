import { atom } from 'jotai';
import type { TPanelFormDrafts } from '@/shared/hooks/usePanelFormDraft';
import type { TAddTicket } from '@/ticket/types';

export const ticketFormDraftsState = atom<TPanelFormDrafts<TAddTicket>>({});
