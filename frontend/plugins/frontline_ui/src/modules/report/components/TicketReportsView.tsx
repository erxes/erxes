import { IconTicket, IconCircleCheck } from '@tabler/icons-react';
import { KpiCard } from '../call/components/KpiSection/KpiCard';

export const TicketReportsView = () => {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Tickets"
          value="0"
          subtitle="All priorities"
          icon={<IconTicket className="h-5 w-5" />}
          valueClass="text-foreground"
          iconClass="bg-muted text-muted-foreground"
        />
        <KpiCard
          title="Resolved"
          value="0"
          subtitle="Closed tickets"
          icon={<IconCircleCheck className="h-5 w-5" />}
          valueClass="text-[var(--pos)]"
          iconClass="bg-[var(--pos)]/10 text-[var(--pos)]"
        />
      </div>
      <div className="text-center text-sm text-muted-foreground">
        Ticket reports coming soon...
      </div>
    </div>
  );
};
