import { atom } from 'jotai';
import type { z } from 'zod';
import type { TICKET_STATUS_FORM_SCHEMA } from '@/settings/schema/ticketStatus';
import type { TPanelFormDrafts } from '@/shared/hooks/usePanelFormDraft';

export const statusPanelDraftsState = atom<
  TPanelFormDrafts<z.infer<typeof TICKET_STATUS_FORM_SCHEMA>>
>({});
