import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';
import { REACT_APP_API_URL } from 'erxes-ui';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { PaymentKind } from '~/modules/payment/types/PaymentMethods';

import ConfigFormContainer from './configs/containers/Form';
import queries from './graphql/queries';

const GOLOMT_PAYMENT = PAYMENT_KINDS[PaymentKind.GOLOMT];

type ConfigsListQueryResponse = {
  golomtBankConfigsList: {
    list: any[];
    totalCount: number;
  };
};

const GolomtBankCard = () => {
  const [open, setOpen] = useState(false);

  const logoUrl = `${REACT_APP_API_URL}/pl:payment/static/images/payments/golomt.png`;

  const { data } = useQuery<ConfigsListQueryResponse>(
    gql(queries.listQuery),
    {
      variables: {
        limit: 1,
      },
      fetchPolicy: 'network-only',
    },
  );

  const configs = data?.golomtBankConfigsList?.list ?? [];
  const hasConfig = configs.length > 0;
  const config = configs[0];

  return (
    <>
      <Card className="space-y-4 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="Golomt Bank"
              className="h-10 w-10 rounded-md object-contain"
            />

            <div>
              <p className="font-semibold">{GOLOMT_PAYMENT.name}</p>
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

                <span className="text-muted-foreground">
                  Organization
                </span>
                <span>{config.organizationName}</span>

                <span className="text-muted-foreground">
                  Client ID
                </span>
                <span>{config.clientId}</span>
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
                {GOLOMT_PAYMENT.description}
              </p>
            </>
          )}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>
              {hasConfig ? 'Manage' : 'Add'} {GOLOMT_PAYMENT.name}
            </Dialog.Title>
          </Dialog.Header>

          <ConfigFormContainer closeModal={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default GolomtBankCard;