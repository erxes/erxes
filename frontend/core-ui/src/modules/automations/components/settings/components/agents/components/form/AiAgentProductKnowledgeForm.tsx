import {
  SelectCategory,
  SelectProduct,
  TAiKnowledgeSourceIndexStatus,
} from 'ui-modules';
import { Form, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type TAiProductKnowledgeConfig = {
  includeCategoryIds?: string[];
  includeProductIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
};

const toArrayValue = (value: string[] | string) =>
  Array.isArray(value) ? value : [value].filter(Boolean);

const normalizeConfig = (
  value?: Record<string, unknown>,
  fallbackProductIds: string[] = [],
): Required<TAiProductKnowledgeConfig> => {
  const legacyCategoryIds = Array.isArray(value?.categoryIds)
    ? value.categoryIds.filter((id): id is string => typeof id === 'string')
    : [];
  const legacyProductIds = Array.isArray(value?.productIds)
    ? value.productIds.filter((id): id is string => typeof id === 'string')
    : [];

  return {
    includeCategoryIds: Array.isArray(value?.includeCategoryIds)
      ? value.includeCategoryIds.filter(
          (id): id is string => typeof id === 'string',
        )
      : legacyCategoryIds,
    includeProductIds: Array.isArray(value?.includeProductIds)
      ? value.includeProductIds.filter(
          (id): id is string => typeof id === 'string',
        )
      : legacyProductIds.length
        ? legacyProductIds
        : fallbackProductIds,
    excludeCategoryIds: Array.isArray(value?.excludeCategoryIds)
      ? value.excludeCategoryIds.filter(
          (id): id is string => typeof id === 'string',
        )
      : [],
    excludeProductIds: Array.isArray(value?.excludeProductIds)
      ? value.excludeProductIds.filter(
          (id): id is string => typeof id === 'string',
        )
      : [],
  };
};

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
  const productConfig = normalizeConfig(config, value);
  const indexedCount = statuses.filter(
    (status) =>
      status.status === 'indexed' &&
      !status.sourceId.startsWith('__scope_run__:'),
  ).length;
  const latestRun = statuses.find((status) =>
    status.sourceId.startsWith('__scope_run__:'),
  );
  const selectedCount =
    productConfig.includeCategoryIds.length +
    productConfig.includeProductIds.length;

  const handleConfigChange = (nextConfig: TAiProductKnowledgeConfig) => {
    const normalized = normalizeConfig({
      ...productConfig,
      ...nextConfig,
    });

    onChange([], normalized);
  };

  const handleEnabledChange = (checked: boolean) => {
    if (!checked) {
      onEnabledChange(false);
      return;
    }

    onEnabledChange(true);
    handleConfigChange(productConfig);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">
            {t('ai-product-knowledge-title', 'Products')}
          </h4>
          <p className="text-sm text-muted-foreground">
            {t('ai-product-knowledge-description', 'Define the bounded product scope this agent may index and retrieve. Use categories for large catalogs, then exclude exceptions.')}
          </p>
        </div>
        <Switch
          checked={enabled}
          aria-label={t('ai-product-knowledge-enabled', 'Enable product search for this agent')}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Form.Item>
              <Form.Label>{t('product-category', 'Product category')}</Form.Label>
              <SelectCategory
                mode="multiple"
                value={productConfig.includeCategoryIds}
                onValueChange={(includeCategoryIds) =>
                  handleConfigChange({
                    includeCategoryIds: toArrayValue(includeCategoryIds),
                  })
                }
              />
              <Form.Description>
                {t('ai-product-include-category-description', 'All products under the selected categories are indexed in the background.')}
              </Form.Description>
            </Form.Item>

            <Form.Item>
              <Form.Label>{t('product', 'Product')}</Form.Label>
              <SelectProduct
                mode="multiple"
                value={productConfig.includeProductIds}
                placeholder={t('ai-product-knowledge-placeholder', 'Select products')}
                onValueChange={(includeProductIds) =>
                  handleConfigChange({
                    includeProductIds: toArrayValue(includeProductIds),
                  })
                }
              />
            </Form.Item>
          </div>

          <div className="space-y-4">
            <Form.Item>
              <Form.Label>{t('or-exclude-product-category', 'Or exclude product category')}</Form.Label>
              <SelectCategory
                mode="multiple"
                value={productConfig.excludeCategoryIds}
                onValueChange={(excludeCategoryIds) =>
                  handleConfigChange({
                    excludeCategoryIds: toArrayValue(excludeCategoryIds),
                  })
                }
              />
            </Form.Item>

            <Form.Item>
              <Form.Label>{t('or-exclude-product', 'Or exclude product')}</Form.Label>
              <SelectProduct
                mode="multiple"
                value={productConfig.excludeProductIds}
                placeholder={t('ai-product-knowledge-placeholder', 'Select products')}
                onValueChange={(excludeProductIds) =>
                  handleConfigChange({
                    excludeProductIds: toArrayValue(excludeProductIds),
                  })
                }
              />
            </Form.Item>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {t('ai-product-selected-scope-count', '{{count}} include selectors', { count: selectedCount })} ·{' '}
        {t('ai-product-indexed-products', '{{count}} indexed', { count: indexedCount })}
        {latestRun?.status === 'indexing' || latestRun?.status === 'queued'
          ? ` · ${t('ai-product-index-progress', '{{processed}} / {{total}} processed', {
              processed: latestRun.processedCount || 0,
              total: latestRun.totalCount || 0,
            })}`
          : ''}
      </p>
    </div>
  );
};
