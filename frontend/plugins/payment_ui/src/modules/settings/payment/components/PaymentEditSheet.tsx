import { IconEdit } from '@tabler/icons-react';
import { Command, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { IPaymentDocument } from '~/modules/payment/types/Payment';
import PaymentForm from './PaymentForm';

export const PaymentEditSheet = ({
  payment,
}: {
  payment: IPaymentDocument;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <Sheet.Trigger asChild>
        <>
          <IconEdit className="w-4 h-4" />
          Edit
        </>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <PaymentForm payment={payment} onCancel={() => setOpen(false)} />
      </Sheet.View>
    </Sheet>
  );
};
