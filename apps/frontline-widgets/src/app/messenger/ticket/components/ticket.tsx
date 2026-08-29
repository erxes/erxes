import { TicketSubmissions } from './ticket-submissions';
import { useCustomerData } from '../../hooks/useCustomerData';
import { NotifyCustomerForm } from '../../components/notify-customer-form';
import { useAtomValue } from 'jotai';
import { selectedTicketConfigAtom, ticketTabAtom } from '../../states';
import { SelectTicketForm } from './select-ticket-form';
import { TicketForm } from './ticket-form';
import { CustomerFormInline } from '../../components/customer-form-inline';

export const Ticket = () => {
  const { hasEmailOrPhone } = useCustomerData();

  const selectedTicketConfig = useAtomValue(selectedTicketConfigAtom);
  const hasTicketFormSelected = !!selectedTicketConfig;
  const page = useAtomValue(ticketTabAtom);

  if (!hasEmailOrPhone)
    return (
      <div className="flex flex-col gap-3 p-4 w-full h-full overflow-y-auto styled-scroll">
        <CustomerFormInline className='rounded-lg' />
      </div>
    );

  const renderContent = () => {
    switch (page) {
      case 'submissions':
        return <TicketSubmissions />;
      case 'selection':
        return (
          (hasTicketFormSelected && <TicketForm />) || <SelectTicketForm />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full overflow-y-auto styled-scroll">
      {renderContent()}
    </div>
  );
};
