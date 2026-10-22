import { INTEGRATIONS } from '@/integrations/constants/integrations';
import {
  IconInbox,
  IconCircleCheck,
  IconTrophyFilled,
  IconChartArcs,
} from '@tabler/icons-react';
import { KpiCard } from '@/report/call/components/KpiSection/KpiCard';
import { Alert, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useConversationReportKpis } from '@/report/hooks/useConversationReportKpis';

export const ConversationReportKpis = () => {
  const { t } = useTranslation('frontline');
  const {
    conversationOpen,
    conversationClosed,
    topPerformingSource,
    topConvertingSource,
    kpiError,
    kpiLoading,
  } = useConversationReportKpis();
  return (
    <>
      {kpiError && (
        <Alert variant="destructive">
          <Alert.Title>
            {t('error-loading-data', 'Error loading data')}
          </Alert.Title>
          <Alert.Description>{kpiError.message}</Alert.Description>
        </Alert>
      )}
      {!kpiError && kpiLoading && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      )}
      <div
        className={
          kpiError || kpiLoading
            ? 'hidden'
            : 'grid grid-cols-2 xl:grid-cols-4 gap-4'
        }
      >
        <KpiCard
          title={t('open-conversations', 'Open Conversations')}
          value={String(conversationOpen?.count ?? 0)}
          subtitle={t('percent-of-total', '{{percent}}% of total', {
            percent: conversationOpen?.percentage ?? 0,
          })}
          icon={<IconInbox className="h-5 w-5" />}
          valueClass="text-[var(--chart-1)]"
          iconClass="bg-[var(--chart-1)]/10 text-[var(--chart-1)]"
        />
        <KpiCard
          title={t('closed-conversations', 'Closed Conversations')}
          value={String(conversationClosed?.count ?? 0)}
          subtitle={t('percent-resolved', '{{percent}}% resolved', {
            percent: conversationClosed?.percentage ?? 0,
          })}
          icon={<IconCircleCheck className="h-5 w-5" />}
          valueClass="text-[var(--pos)]"
          iconClass="bg-[var(--pos)]/10 text-[var(--pos)]"
        />
        <KpiCard
          title={t('top-performing-source', 'Top Performing Source')}
          value={String(topPerformingSource?.count ?? 0)}
          subtitle={
            INTEGRATIONS[topPerformingSource?._id as keyof typeof INTEGRATIONS]
              ?.name
              ? t('source-name-percent', '{{name}} · {{percent}}%', {
                  name: INTEGRATIONS[
                    topPerformingSource?._id as keyof typeof INTEGRATIONS
                  ].name,
                  percent: topPerformingSource?.percentage ?? 0,
                })
              : t('percent-share', '{{percent}}% share', {
                  percent: topPerformingSource?.percentage ?? 0,
                })
          }
          icon={<IconTrophyFilled className="h-5 w-5" />}
          valueClass="text-[var(--chart-2)]"
          iconClass="bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
        />
        <KpiCard
          title={t('top-converting-source', 'Top Converting Source')}
          value={String(topConvertingSource?.count ?? 0)}
          subtitle={
            INTEGRATIONS[topConvertingSource?._id as keyof typeof INTEGRATIONS]
              ?.name
              ? t('source-name-percent', '{{name}} · {{percent}}%', {
                  name: INTEGRATIONS[
                    topConvertingSource?._id as keyof typeof INTEGRATIONS
                  ].name,
                  percent: topConvertingSource?.percentage ?? 0,
                })
              : t('percent-share', '{{percent}}% share', {
                  percent: topConvertingSource?.percentage ?? 0,
                })
          }
          icon={<IconChartArcs className="h-5 w-5" />}
          valueClass="text-[var(--chart-3)]"
          iconClass="bg-[var(--chart-3)]/10 text-[var(--chart-3)]"
        />
      </div>
    </>
  );
};
