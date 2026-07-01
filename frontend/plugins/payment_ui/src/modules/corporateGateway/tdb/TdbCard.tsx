import React, { useState } from 'react';
import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { PaymentKind } from '~/modules/payment/types/PaymentMethods';
import { useQuery } from '@apollo/client';
import { configs } from './configs/graphql/queries';
import { REACT_APP_API_URL } from 'erxes-ui';
import ConfigFormContainer from './configs/containers/Form';

const TDB_PAYMENT = PAYMENT_KINDS[PaymentKind.TDB];

const TdbCard = () => {
  const [open, setOpen] = useState(false);
  const { data, refetch } = useQuery(configs);
  const logoUrl = `${REACT_APP_API_URL}/pl:payment/static/images/payments/tdb.png`;
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card className="p-4 space-y-3">
        {/* same as before */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="TDB"
              className="h-10 w-10 rounded-md object-contain"
            />
            <div>
              <p className="font-semibold">{TDB_PAYMENT.name}</p>
              <p className="text-xs text-muted-foreground">(Accepts MNT)</p>
            </div>
          </div>
          <Button variant="link" size="sm" onClick={() => setOpen(true)}>
            + Add
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {TDB_PAYMENT.description}
        </p>

        {/* Optionally display existing configs */}
        {data?.tdbConfigs?.map((cfg: any) => (
          <div
            key={cfg._id}
            className="flex justify-between items-center text-sm"
          >
            <span>{cfg.name}</span>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              Edit
            </Button>
          </div>
        ))}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Add {TDB_PAYMENT.name}</Dialog.Title>
          </Dialog.Header>

          <ConfigFormContainer
            configId={undefined} // pass id if editing
            closeModal={handleClose}
            refetchList={refetch}
          />
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default TdbCard;
