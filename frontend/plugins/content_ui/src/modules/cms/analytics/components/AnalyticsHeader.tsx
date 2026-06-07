import { IconRefresh } from '@tabler/icons-react';
import { Button, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'ui-modules';
import { PostsNavigation } from '../../posts/components/PostsNavigation';
import {
  type AnalyticsDateRangeOption,
  type AnalyticsHeaderProps,
  isCmsAnalyticsDateRange,
} from '../types';

const DATE_RANGE_OPTIONS: AnalyticsDateRangeOption[] = [
  { value: 'LAST_7_DAYS', labelKey: 'date-ranges.last-7-days' },
  { value: 'LAST_28_DAYS', labelKey: 'date-ranges.last-28-days' },
  { value: 'LAST_90_DAYS', labelKey: 'date-ranges.last-90-days' },
];

export const AnalyticsHeader = ({
  dateRange,
  loading,
  onDateRangeChange,
  onRefresh,
}: AnalyticsHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'cms.analytics',
  });

  return (
    <PageHeader>
      <PostsNavigation />
      <PageHeader.End>
        <ToggleGroup
          aria-label={t('date-range')}
          type="single"
          value={dateRange}
          onValueChange={(value) => {
            if (isCmsAnalyticsDateRange(value)) {
              onDateRangeChange(value);
            }
          }}
          variant="outline"
        >
          {DATE_RANGE_OPTIONS.map((option) => (
            <ToggleGroup.Item key={option.value} value={option.value}>
              {t(option.labelKey)}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
        <Button
          aria-label={t('refresh')}
          disabled={loading}
          onClick={onRefresh}
          size="icon"
          variant="ghost"
        >
          <IconRefresh />
        </Button>
      </PageHeader.End>
    </PageHeader>
  );
};
