import { StatusGroup } from '@/status/components/StatusGroup';
import { TICKET_STATUS_TYPES } from '@/status/constants';

export const Statuses = () => {
  return (
    <section className="px-4 sm:px-8 lg:px-16 mx-auto max-w-2xl w-full h-full flex flex-col overflow-y-auto hide-scroll styled-scroll">
      <h1 className="text-xl font-semibold shrink-0">Ticket statuses</h1>
      <div className="mt-4 w-full border border-muted-foreground/15 rounded-md flex-1">
        {Object.values(TICKET_STATUS_TYPES).map((statusType) => (
          <StatusGroup key={statusType} statusType={statusType} />
        ))}
      </div>
    </section>
  );
};
