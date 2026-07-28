import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { REACT_APP_API_URL } from 'erxes-ui';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { PaymentKind } from '~/modules/payment/types/PaymentMethods';

import GatewayCard from '../GatewayCard';
import ConfigFormContainer from './configs/containers/Form';
import queries from './graphql/queries';

const GOLOMT_PAYMENT = PAYMENT_KINDS[PaymentKind.GOLOMT];

type GolomtBankConfig = {
  _id: string;
  name: string;
  organizationName: string;
  clientId: string;
};

type ConfigsListQueryResponse = {
  golomtBankConfigsList: {
    list: GolomtBankConfig[];
    totalCount: number;
  };
};

const GolomtBankCard = () => {
  const [open, setOpen] = useState(false);

  const { data, loading, error } = useQuery<ConfigsListQueryResponse>(
    gql(queries.listQuery),
    {
      variables: { limit: 1 },
      fetchPolicy: 'network-only',
    },
  );

  const configs = data?.golomtBankConfigsList?.list ?? [];
  const config = configs[0];
  const hasConfig = configs.length > 0;

  return (
    <GatewayCard
      logo={`${REACT_APP_API_URL}/pl:payment/static/images/payments/golomt.png`}
      title={GOLOMT_PAYMENT.name}
      description={GOLOMT_PAYMENT.description}
      loading={loading}
      error={!!error}
      hasConfig={hasConfig}
      open={open}
      onOpenChange={setOpen}
      connectedContent={
        <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
          <span className="text-muted-foreground">Name</span>
          <span>{config?.name}</span>

          <span className="text-muted-foreground">Organization</span>
          <span>{config?.organizationName}</span>

          <span className="text-muted-foreground">Client ID</span>
          <span>{config?.clientId}</span>
        </div>
      }
      form={<ConfigFormContainer closeModal={() => setOpen(false)} />}
    />
  );
};

export default GolomtBankCard;
