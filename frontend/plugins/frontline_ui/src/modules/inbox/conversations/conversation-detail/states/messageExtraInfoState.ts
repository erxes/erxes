import { EnumFacebookTag } from '@/integrations/facebook/types/FacebookTypes';
import { atom } from 'jotai';

export const messageExtraInfoState = atom<
  { tag?: EnumFacebookTag } | undefined
>(undefined);
