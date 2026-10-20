import { useSaveEbarimtRuleConfig } from '@/ebarimt/settings/hooks/useSaveEbarimtRuleConfig';
import {
  normalizeRuleIds,
  TPosInEbarimtConfig,
} from '@/ebarimt/settings/pos-in-ebarimt-config/types';

export const useSavePosInEbarimtConfig = () => {
  const { saveConfig, loading } = useSaveEbarimtRuleConfig('posInEbarimt');

  const savePosInEbarimtConfig = (
    config: TPosInEbarimtConfig,
    operation: 'create' | 'update',
    configId?: string,
  ) =>
    saveConfig(
      config.posId,
      {
        ...config,
        reverseVatRules: normalizeRuleIds(config.reverseVatRules),
        reverseCtaxRules: normalizeRuleIds(config.reverseCtaxRules),
      },
      operation,
      configId,
    );

  return { savePosInEbarimtConfig, loading };
};
