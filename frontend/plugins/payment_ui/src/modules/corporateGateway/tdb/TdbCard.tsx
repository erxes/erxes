import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';
import { REACT_APP_API_URL } from 'erxes-ui';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { PaymentKind } from '~/modules/payment/types/PaymentMethods';
import { configs } from './configs/graphql/queries';
import ConfigFormContainer from './configs/containers/Form';

const TDB_PAYMENT = PAYMENT_KINDS[PaymentKind.TDB];

const TdbCard = () => {
  const [open, setOpen] = useState(false);

  const { data, refetch } = useQuery(configs);

  const configsList = data?.tdbConfigs ?? [];
  const hasConfig = configsList.length > 0;
  const config = configsList[0];

  const logoUrl = `${REACT_APP_API_URL}/pl:payment/static/images/payments/tdb.png`;

  const handleClose = () => setOpen(false);

  return (
    <>
      <Card className="space-y-4 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="TDB"
              className="h-10 w-10 rounded-md object-contain"
            />

            <div>
              <p className="font-semibold">{TDB_PAYMENT.name}</p>
              <p className="text-xs text-muted-foreground">
                (Accepts MNT)
              </p>
            </div>
          </div>

          <Button
            variant="link"
            size="sm"
            onClick={() => setOpen(true)}
          >
            {hasConfig ? 'Manage' : '+ Add'}
          </Button>
        </div>

        <div className="space-y-3">
          {hasConfig ? (
            <>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Connected</span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
                <span className="text-muted-foreground">Name</span>
                <span>{config.name}</span>

                <span className="text-muted-foreground">Merchant</span>
                <span>{config.username}</span>

                <span className="text-muted-foreground">Environment</span>
                <span>{config.testMode ? 'Test' : 'Production'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                <span className="text-sm font-medium">
                  Not connected
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {TDB_PAYMENT.description}
              </p>
            </>
          )}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>
              {hasConfig ? 'Manage' : 'Add'} {TDB_PAYMENT.name}
            </Dialog.Title>
          </Dialog.Header>

          <ConfigFormContainer
            configId={config?._id}
            closeModal={handleClose}
            refetchList={refetch}
          />
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default TdbCard;
