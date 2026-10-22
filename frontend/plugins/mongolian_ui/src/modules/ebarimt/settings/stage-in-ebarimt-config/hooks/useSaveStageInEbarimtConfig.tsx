import { useSaveEbarimtRuleConfig } from '@/ebarimt/settings/hooks/useSaveEbarimtRuleConfig';
import {
  normalizeRuleIds,
  TStageInEbarimtConfig,
} from '@/ebarimt/settings/stage-in-ebarimt-config/types';

export const useSaveStageInEbarimtConfig = () => {
  const { saveConfig } = useSaveEbarimtRuleConfig('stageInEbarimt');

  const saveStageInEbarimtConfig = (
    config: TStageInEbarimtConfig,
    operation: 'create' | 'update',
    configId?: string,
  ) =>
    saveConfig(
      config.stageId,
      {
        ...config,
        reverseVatRules: normalizeRuleIds(config.reverseVatRules),
        reverseCtaxRules: normalizeRuleIds(config.reverseCtaxRules),
      },
      operation,
      configId,
    );

  return { saveStageInEbarimtConfig };
};
