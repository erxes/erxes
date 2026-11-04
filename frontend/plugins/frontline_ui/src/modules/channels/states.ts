import { atom } from 'jotai';
import type { TChannelMemberForm, TChannelForm } from '@/channels/types';
import type { TPanelFormDrafts } from '@/shared/hooks/usePanelFormDraft';

export const channelCreateSheetOpenState = atom(false);

export const channelPanelDraftsState = atom<TPanelFormDrafts<TChannelForm>>({});

export const channelMembersPanelDraftsState = atom<
  TPanelFormDrafts<TChannelMemberForm>
>({});
