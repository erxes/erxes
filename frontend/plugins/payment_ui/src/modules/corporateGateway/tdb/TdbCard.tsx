import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { REACT_APP_API_URL } from 'erxes-ui';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { PaymentKind } from '~/modules/payment/types/PaymentMethods';
import GatewayCard from '../GatewayCard';
import { configs } from './configs/graphql/queries';
import ConfigFormContainer from './configs/containers/Form';

const TDB_PAYMENT = PAYMENT_KINDS[PaymentKind.TDB];

type TdbConfig = {
  _id: string;
  name: string;
  username: string;
  testMode: boolean;
};

type TdbConfigsQueryResponse = {
  tdbConfigs: TdbConfig[];
};

const TdbCard = () => {
  const [open, setOpen] = useState(false);

  const { data, loading, error, refetch } =
    useQuery<TdbConfigsQueryResponse>(configs);

  const configsList = data?.tdbConfigs ?? [];
  const config = configsList[0];
  const hasConfig = configsList.length > 0;

  const handleClose = () => setOpen(false);

  return (
    <GatewayCard
      logo={`${REACT_APP_API_URL}/pl:payment/static/images/payments/tdb.png`}
      title={TDB_PAYMENT.name}
      description={TDB_PAYMENT.description}
      loading={loading}
      error={!!error}
      hasConfig={hasConfig}
      open={open}
      onOpenChange={setOpen}
      connectedContent={
        <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
          <span className="text-muted-foreground">Name</span>
          <span>{config?.name}</span>

          <span className="text-muted-foreground">Merchant</span>
          <span>{config?.username}</span>

          <span className="text-muted-foreground">Environment</span>
          <span>{config?.testMode ? 'Test' : 'Production'}</span>
        </div>
      }
      form={
        <ConfigFormContainer
          configId={config?._id}
          closeModal={handleClose}
          refetchList={refetch}
        />
      }
    />
  );
};

export default TdbCard;