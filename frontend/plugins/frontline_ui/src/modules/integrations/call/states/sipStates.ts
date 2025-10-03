import { atomWithStorage } from 'jotai/utils';
import { ICallConfigDoc } from '@/integrations/call/types/callTypes';
import { atom } from 'jotai';
import {
  CallStatusEnum,
  ISipState,
  SipStatusEnum,
} from '@/integrations/call/types/sipTypes';

export const callConfigAtom = atomWithStorage<ICallConfigDoc | null>(
  'config:call_integrations',
  null,
  undefined,
  { getOnInit: true },
);

export const callInfoAtom = atomWithStorage<{
  isUnregistered?: boolean;
} | null>('callInfo', null, undefined, { getOnInit: true });

export const sipStateAtom = atom<ISipState>({
  sipStatus: SipStatusEnum.DISCONNECTED,
  sipErrorType: null,
  sipErrorMessage: null,
  callStatus: CallStatusEnum.IDLE,
  callDirection: null,
  callCounterpart: null,
  groupName: '',
  callId: null,
});

export const rtcSessionAtom = atom<any>(null);

export const phoneToCallAtom = atom<string>('');
