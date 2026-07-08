import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { REACT_APP_API_URL } from 'erxes-ui';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { PaymentKind } from '~/modules/payment/types/PaymentMethods';

import GatewayCard from '../GatewayCard';
import ConfigFormContainer from './configs/containers/Form';
import { queries } from './configs/graphql';

const KHANBANK_PAYMENT = PAYMENT_KINDS[PaymentKind.KHANBANK];

type KhanbankConfig = {
  _id: string;
  name: string;
  consumerKey: string;
};

type ConfigsListQueryResponse = {
  khanbankConfigsList: {
    list: KhanbankConfig[];
    totalCount: number;
  };
};

const KhanBankCard = () => {
  const [open, setOpen] = useState(false);

  const { data, loading, error } =
    useQuery<ConfigsListQueryResponse>(gql(queries.listQuery), {
      fetchPolicy: 'network-only',
    });

  const configs = data?.khanbankConfigsList?.list ?? [];
  const config = configs[0];
  const hasConfig = configs.length > 0;

  return (
    <GatewayCard
      logo={`${REACT_APP_API_URL}/pl:payment/static/images/payments/khanbank.png`}
      title={KHANBANK_PAYMENT.name}
      description={KHANBANK_PAYMENT.description}
      loading={loading}
      error={!!error}
      hasConfig={hasConfig}
      open={open}
      onOpenChange={setOpen}
      connectedContent={
        <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
          <span className="text-muted-foreground">Name</span>
          <span>{config?.name}</span>

          <span className="text-muted-foreground">Consumer Key</span>
          <span>{config?.consumerKey}</span>
        </div>
      }
      form={
        <ConfigFormContainer closeModal={() => setOpen(false)} />
      }
    />
  );
};

export default KhanBankCard;