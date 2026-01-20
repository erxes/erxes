import { atom } from 'jotai';
import { EnumFacebookTag } from '@/integrations/facebook/types/FacebookTypes';
import { EnumInstagramTag } from '@/integrations/instagram/types/InstagramTypes';

type MessageExtraInfo = {
  tag?: EnumFacebookTag | EnumInstagramTag;
};

export const messageExtraInfoState = atom<MessageExtraInfo | undefined>(
  undefined
);
