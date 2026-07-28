import { IconTicket, IconCircleCheck } from '@tabler/icons-react';
import { KpiCard } from '../call/components/KpiSection/KpiCard';
import { useTranslation } from 'react-i18next';

export const TicketReportsView = () => {
  const { t } = useTranslation('frontline');
  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={t('total-tickets')}
          value="0"
          subtitle={t('all-priorities')}
          icon={<IconTicket className="h-5 w-5" />}
          valueClass="text-foreground"
          iconClass="bg-muted text-muted-foreground"
        />
        <KpiCard
          title={t('resolved')}
          value="0"
          subtitle={t('closed-tickets')}
          icon={<IconCircleCheck className="h-5 w-5" />}
          valueClass="text-[var(--pos)]"
          iconClass="bg-[var(--pos)]/10 text-[var(--pos)]"
        />
      </div>
      <div className="text-center text-sm text-muted-foreground">
        {t('ticket-reports-coming-soon')}
      </div>
    </div>
  );
};
