import { useState } from 'react';
import { TicketForm } from './ticket-form';
import { TicketSubmissions } from './ticket-submissions';
import { NotifyCustomerForm } from './notify-customer-form';
import { useCustomerData } from '../../hooks/useCustomerData';

export const Ticket = () => {
  const { hasEmailOrPhone } = useCustomerData();
  const [page, setPage] = useState<'submissions' | 'submit' | 'progress'>(
    'submissions',
  );
  if (!hasEmailOrPhone)
    return <NotifyCustomerForm onSuccess={() => setPage('submit')} />;

  const renderPage = () => {
    switch (page) {
      case 'submit':
        return <TicketForm setPage={setPage} />;
      default:
        return <TicketSubmissions setPage={setPage} />;
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full overflow-y-auto styled-scroll">
      {renderPage()}
    </div>
  );
};
