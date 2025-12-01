import { useMemo, useState } from 'react';
import { TicketForm } from './ticket-form';
import { TicketSubmissions } from './ticket-submissions';
import { NotifyCustomerForm } from './notify-customer-form';
import { getLocalStorageItem } from '@libs/utils';
import { connectionAtom } from '../../states';
import { useAtom } from 'jotai';

export const Ticket = () => {
  const [connection] = useAtom(connectionAtom);
  const [page, setPage] = useState<'submissions' | 'submit' | 'progress'>(
    'submissions',
  );
  const erxes = useMemo(() => getLocalStorageItem('erxes'), [connection]);
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
