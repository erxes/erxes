import { useState } from 'react';
import { TicketForm } from './ticket-form';
import { TicketSubmissions } from './ticket-submissions';

export const Ticket = () => {
  const [page, setPage] = useState<'submissions' | 'submit' | 'progress'>('submissions');

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
