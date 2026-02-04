import { useState } from 'react';
import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';

import ConfigFormContainer from './configs/containers/Form';
import { Dialog } from 'erxes-ui/components/dialog';

const API_URL =
  (window as any)?.WIDGET_CONFIG?.API_URL || '';

const GolomtBankCard = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${API_URL}/static/images/payments/golomt.png`}
              alt="Golomt Bank"
              className="h-10 w-10 rounded-md object-contain"
            />

            <div>
              <p className="font-semibold">Golomt E-Commerce</p>
              <p className="text-xs text-muted-foreground">
                ( Accepts MNT )
              </p>
            </div>
          </div>

          <Button
            variant="link"
            size="sm"
            onClick={() => setOpen(true)}
          >
            + Add
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Becoming an E-Commerce merchant for online sales and payment we offer
          products and services 24/7. Accepts most type of domestic and foreign card
          and provide opportunity to make and receive payment from anywhere
        </p>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Add Golomt E-Commerce</Dialog.Title>
          </Dialog.Header>

          <ConfigFormContainer closeModal={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default GolomtBankCard;
