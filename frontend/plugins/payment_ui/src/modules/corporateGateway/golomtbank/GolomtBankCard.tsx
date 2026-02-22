import { useState } from 'react';
import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { PaymentKind } from '~/modules/payment/types/PaymentMethods';

import ConfigFormContainer from './configs/containers/Form';

const GOLOMT_PAYMENT = PAYMENT_KINDS[PaymentKind.GOLOMT];

const GolomtBankCard = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src="http://localhost:3310/images/payments/golomt.png"
              alt="Golomt Bank"
              className="h-10 w-10 rounded-md object-contain"
            />

            <div>
              <p className="font-semibold">{GOLOMT_PAYMENT.name}</p>
              <p className="text-xs text-muted-foreground">(Accepts MNT)</p>
            </div>
          </div>

          <Button variant="link" size="sm" onClick={() => setOpen(true)}>
            + Add
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {GOLOMT_PAYMENT.description}
        </p>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Add {GOLOMT_PAYMENT.name}</Dialog.Title>
          </Dialog.Header>

          <ConfigFormContainer closeModal={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default GolomtBankCard;
