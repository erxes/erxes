import { useState } from 'react';
import { TicketForm } from './ticket-form';
import { TicketSubmissions } from './ticket-submissions';
import { useCustomerData } from '../../hooks/useCustomerData';
import { NotifyCustomerForm } from '../../components/notify-customer-form';
import { Tabs } from 'erxes-ui';

export const Ticket = () => {
  const { hasEmailOrPhone } = useCustomerData();
  const [page, setPage] = useState<'submissions' | 'submit'>('submissions');
  if (!hasEmailOrPhone) return <NotifyCustomerForm />;

  const renderContent = () => {
    if (page === 'submissions') return <TicketSubmissions setPage={setPage} />;
    if (page === 'submit') return <TicketForm setPage={setPage} />;
    return null;
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full overflow-y-auto styled-scroll">
      {renderContent()}
    </div>
  );
};
