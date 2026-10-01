import { IconCalendarEvent, IconChartBar } from '@tabler/icons-react';
import { Skeleton } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TLoyaltyAccountTypeFormValues } from '../hooks/useLoyaltyAccountTypeForm';
import { useLoyaltyAccountTypePeriodPreview } from '../hooks/useLoyaltyAccountTypePeriodPreview';

// What these settings do, before they are saved.
export const LoyaltyAccountTypePeriodPreview = ({
  control,
  accountTypeId,
}: {
  control: Control<TLoyaltyAccountTypeFormValues>;
  accountTypeId?: string;
}) => {
  const { t } = useTranslation('loyalty');
  const {
    loading,
    error,
    expiryLine,
    pendingLine,
    nextResetLine,
    tierLine,
    noEarnLine,
    impact,
  } = useLoyaltyAccountTypePeriodPreview({ control, accountTypeId });

  if (loading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {t('period-preview-error', { message: error.message })}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
      <div className="flex gap-2">
        <IconCalendarEvent className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <span className="font-medium">{t('period-preview-title')}</span>
          {expiryLine && <span>{expiryLine}</span>}
          {pendingLine && <span>{pendingLine}</span>}
          {nextResetLine && <span>{nextResetLine}</span>}
          {tierLine && <span>{tierLine}</span>}
          {noEarnLine && <span>{noEarnLine}</span>}
        </div>
      </div>
      {impact && (
        <div className="flex gap-2 border-t pt-3">
          <IconChartBar className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <span className="font-medium">
              {t('period-preview-impact-title')}
            </span>
            <span>
              {t('period-preview-impact-points', {
                count: impact.accounts,
                cleared: impact.pointsCleared.toLocaleString(),
                kept: impact.pointsKept.toLocaleString(),
              })}
            </span>
            {impact.tierChanges.map((line) => (
              <span key={line}>{line}</span>
            ))}
            {impact.sampled && (
              <span className="text-xs text-muted-foreground">
                {t('period-preview-sampled', {
                  checked: impact.accounts,
                  total: impact.total,
                })}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
