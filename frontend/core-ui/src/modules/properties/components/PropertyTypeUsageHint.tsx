import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  formatUsageTotal,
  IFieldValueCounts,
  IFieldValueUsage,
} from '../hooks/useFieldValueUsage';
import { PropertyUsageRecords } from './PropertyUsageRecords';

// Says why only similar types are offered, and where to fix that.
export const PropertyTypeUsageHint = ({
  fieldId,
  contentType,
  usage,
  counts,
  loading,
  unused,
}: {
  fieldId: string;
  contentType: string;
  usage?: IFieldValueUsage;
  // Arrives after the samples; the total shows once it does.
  counts?: IFieldValueCounts;
  loading: boolean;
  unused: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  if (loading || unused) {
    return null;
  }

  if (!usage?.known) {
    return (
      <p className="text-sm text-muted-foreground">
        {t(
          'type-limited-unknown',
          'Could not check its records, so only types with the same stored value are offered.',
        )}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
      {usage.samples.length > 0 && (
        <p>
          {counts?.known
            ? t(
                'type-limited-values',
                '{{total}} records hold a value, so only types with the same stored value are offered.',
                { count: counts.count, total: formatUsageTotal(counts) },
              )
            : t(
                'type-limited-has-values',
                'Records hold a value, so only types with the same stored value are offered.',
              )}{' '}
          <PropertyUsageRecords fieldId={fieldId} contentType={contentType}>
            <Button variant="link" size="sm" className="inline h-auto p-0">
              {t('view', 'View')}
            </Button>
          </PropertyUsageRecords>
        </p>
      )}
      {usage.dependents.length > 0 && (
        <p>
          {t('type-limited-dependents', 'Rules in {{names}} depend on it.', {
            names: usage.dependents.join(', '),
          })}
        </p>
      )}
    </div>
  );
};
