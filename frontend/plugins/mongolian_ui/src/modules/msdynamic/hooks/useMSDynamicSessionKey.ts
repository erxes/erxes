import {
  getMSDynamicSessionKey,
  MSDynamicTab,
} from '~/modules/msdynamic/constants/msDynamicSessionKey';

export const useMSDynamicSessionKey = (tab: MSDynamicTab) => {
  return {
    sessionKey: getMSDynamicSessionKey(tab),
  };
};
