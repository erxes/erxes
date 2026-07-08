import { useState } from 'react';
import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { PaymentKind } from '~/modules/payment/types/PaymentMethods';
import { REACT_APP_API_URL } from 'erxes-ui';
import ConfigFormContainer from './configs/containers/Form';

const KHANBANK_PAYMENT = PAYMENT_KINDS[PaymentKind.KHANBANK];

const KhanBankCard = () => {
  const [open, setOpen] = useState(false);
  const logoUrl = `${REACT_APP_API_URL}/pl:payment/static/images/payments/khanbank.png`;
  return (
    <>
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="Khan Bank"
              className="h-10 w-10 rounded-md object-contain"
            />

            <div>
              <p className="font-semibold">{KHANBANK_PAYMENT.name}</p>
              <p className="text-xs text-muted-foreground">(Accepts MNT)</p>
            </div>
          </div>

          <Button variant="link" size="sm" onClick={() => setOpen(true)}>
            + Add
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {KHANBANK_PAYMENT.description}
        </p>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Add {KHANBANK_PAYMENT.name}</Dialog.Title>
          </Dialog.Header>

          <ConfigFormContainer closeModal={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default KhanBankCard;
