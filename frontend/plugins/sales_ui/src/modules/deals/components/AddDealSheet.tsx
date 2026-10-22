import { AddCardForm } from '@/deals/cards/components/AddCardForm';
import { Sheet } from 'erxes-ui';
import { dealCreateSheetState } from '@/deals/states/dealCreateSheetState';
import { useAtom } from 'jotai';

export const AddDealSheet = ({
  onComplete: onCompleteProp,
  showWorkflowFields,
  contacts,
}: {
  onComplete?: (dealId: string) => void;
  showWorkflowFields?: boolean;
  contacts?: { customerId?: string; companyId?: string };
}) => {
  const [open, setOpen] = useAtom(dealCreateSheetState);

  const onOpen = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.View
        className="sm:max-w-3xl w-full p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <AddCardForm
          onCloseSheet={onClose}
          onComplete={onCompleteProp}
          showWorkflowFields={showWorkflowFields}
          contacts={contacts}
        />
      </Sheet.View>
    </Sheet>
  );
};
