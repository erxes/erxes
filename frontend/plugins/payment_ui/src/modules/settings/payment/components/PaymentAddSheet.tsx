import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import PaymentForm from './PaymentForm';

export const PaymentAddSheet = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <Sheet.Trigger asChild>
        <Button variant="outline">Add Payment</Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <PaymentForm payment={null} onCancel={() => setOpen(false)} />
      </Sheet.View>
    </Sheet>
  );
};
