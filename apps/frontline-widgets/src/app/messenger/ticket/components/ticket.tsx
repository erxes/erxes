import { useState } from 'react';
import { TicketForm } from './ticket-form';
import { TicketSubmissions } from './ticket-submissions';
import { useCustomerData } from '../../hooks/useCustomerData';
import { NotifyCustomerForm } from '../../components/notify-customer-form';

export const Ticket = () => {
  const { hasEmailOrPhone } = useCustomerData();
  const [page, setPage] = useState<'submissions' | 'submit' | 'progress'>(
    'submissions',
  );
  if (!hasEmailOrPhone) return <NotifyCustomerForm />;

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
