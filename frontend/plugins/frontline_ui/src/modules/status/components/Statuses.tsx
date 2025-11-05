import { StatusGroup } from '@/status/components/StatusGroup';
import { TICKET_STATUS_TYPES } from '@/status/constants';

export const Statuses = () => {
  return (
    <section className="w-full pb-24">
      <h1 className="text-xl font-semibold">Ticket statuses</h1>
      <div className="mt-4 w-full border border-muted-foreground/15 rounded-md">
        {Object.values(TICKET_STATUS_TYPES).map((statusType) => (
          <StatusGroup key={statusType} statusType={statusType} />
        ))} 
      </div>
    </section>
  );
};
