import { useState } from 'react';
import { TicketForm } from './ticket-form';
import { TicketSubmissions } from './ticket-submissions';
import { NotifyCustomerForm } from './notify-customer-form';
import { getLocalStorageItem } from '@libs/utils';

export const Ticket = () => {
  const erxes = JSON.parse(getLocalStorageItem('erxes') ?? '{}');
  const [page, setPage] = useState<'submissions' | 'submit'>('submit');

  if (!erxes || Object.keys(erxes).length === 0)
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
