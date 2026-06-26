import { SelectProduct, TAiKnowledgeSourceIndexStatus } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const AiAgentProductKnowledgeForm = ({
  value,
  statuses,
  onChange,
}: {
  value: string[];
  statuses: TAiKnowledgeSourceIndexStatus[];
  onChange: (sourceIds: string[]) => void;
}) => {
  const { t } = useTranslation('automations');
  const indexedCount = statuses.filter(
    (status) => status.status === 'indexed',
  ).length;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">
          {t('ai-product-knowledge-title')}
        </h4>
        <p className="text-sm text-muted-foreground">
          {t('ai-product-knowledge-description')}
        </p>
      </div>

      <SelectProduct
        mode="multiple"
        value={value}
        placeholder={t('ai-product-knowledge-placeholder')}
        onValueChange={(productIds) =>
          onChange(Array.isArray(productIds) ? productIds : [productIds])
        }
      />

      <p className="text-xs text-muted-foreground">
        {value.length} selected · {indexedCount} indexed
      </p>
    </div>
  );
};
