import { useAiAgentProductKnowledgeForm } from '@/automations/components/settings/components/agents/hooks/useAiAgentProductKnowledgeForm';
import {
  SelectCategory,
  SelectProduct,
  TAiKnowledgeSourceIndexStatus,
} from 'ui-modules';
import { Form, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AiAgentProductKnowledgeForm = ({
  enabled,
  value,
  config,
  statuses,
  onEnabledChange,
  onChange,
}: {
  enabled: boolean;
  value: string[];
  config?: Record<string, unknown>;
  statuses: TAiKnowledgeSourceIndexStatus[];
  onEnabledChange: (enabled: boolean) => void;
  onChange: (sourceIds: string[], config?: Record<string, unknown>) => void;
}) => {
  const { t } = useTranslation('automations');
  const {
    productConfig,
    selectedCount,
    indexedCount,
    indexProgress,
    changeField,
    handleEnabledChange,
  } = useAiAgentProductKnowledgeForm({
    value,
    config,
    statuses,
    onEnabledChange,
    onChange,
  });

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">
            {t('ai-product-knowledge-title')}
          </h4>
          <p className="text-sm text-muted-foreground">
            {t('ai-product-knowledge-description')}
          </p>
        </div>
        <Switch
          checked={enabled}
          aria-label={t('ai-product-knowledge-enabled')}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Form.Item>
              <Form.Label>{t('product-category')}</Form.Label>
              <SelectCategory
                mode="multiple"
                value={productConfig.includeCategoryIds}
                onValueChange={changeField('includeCategoryIds')}
              />
              <Form.Description>
                {t('ai-product-include-category-description')}
              </Form.Description>
            </Form.Item>

            <Form.Item>
              <Form.Label>{t('product')}</Form.Label>
              <SelectProduct
                mode="multiple"
                value={productConfig.includeProductIds}
                placeholder={t('ai-product-knowledge-placeholder')}
                onValueChange={changeField('includeProductIds')}
              />
            </Form.Item>
          </div>

          <div className="space-y-4">
            <Form.Item>
              <Form.Label>{t('or-exclude-product-category')}</Form.Label>
              <SelectCategory
                mode="multiple"
                value={productConfig.excludeCategoryIds}
                onValueChange={changeField('excludeCategoryIds')}
              />
            </Form.Item>

            <Form.Item>
              <Form.Label>{t('or-exclude-product')}</Form.Label>
              <SelectProduct
                mode="multiple"
                value={productConfig.excludeProductIds}
                placeholder={t('ai-product-knowledge-placeholder')}
                onValueChange={changeField('excludeProductIds')}
              />
            </Form.Item>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {t('ai-product-selected-scope-count', { count: selectedCount })} ·{' '}
        {t('ai-product-indexed-products', { count: indexedCount })}
        {indexProgress && (
          <> · {t('ai-product-index-progress', indexProgress)}</>
        )}
      </p>
    </div>
  );
};
