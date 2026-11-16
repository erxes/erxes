import {
  indexedProductCount,
  indexProgressOf,
  normalizeProductKnowledgeConfig,
  toArrayValue,
  TProductKnowledgeField,
} from '@/automations/components/settings/components/agents/utils/productKnowledgeConfig';
import { useCallback } from 'react';
import { TAiKnowledgeSourceIndexStatus } from 'ui-modules';

/**
 * Product knowledge scope: which categories and products the agent reads, and
 * how far indexing them has come. Every change saves the whole config.
 */
export const useAiAgentProductKnowledgeForm = ({
  value,
  config,
  statuses,
  onEnabledChange,
  onChange,
}: {
  value: string[];
  config?: Record<string, unknown>;
  statuses: TAiKnowledgeSourceIndexStatus[];
  onEnabledChange: (enabled: boolean) => void;
  onChange: (sourceIds: string[], config?: Record<string, unknown>) => void;
}) => {
  const productConfig = normalizeProductKnowledgeConfig(config, value);

  const changeField = useCallback(
    (field: TProductKnowledgeField) => (next: string[] | string) =>
      onChange([], { ...productConfig, [field]: toArrayValue(next) }),
    [onChange, productConfig],
  );

  // Turning it on saves the scope as it is shown
  const handleEnabledChange = useCallback(
    (checked: boolean) => {
      onEnabledChange(checked);

      if (checked) {
        onChange([], productConfig);
      }
    },
    [onEnabledChange, onChange, productConfig],
  );

  return {
    productConfig,
    selectedCount:
      productConfig.includeCategoryIds.length +
      productConfig.includeProductIds.length,
    indexedCount: indexedProductCount(statuses),
    indexProgress: indexProgressOf(statuses),
    changeField,
    handleEnabledChange,
  };
};
