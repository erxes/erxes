import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import { ChildProps } from '@apollo/client/react/hoc';

import SelectPayments from '../components/SelectPayments';
import { queries } from '../graphql';
import { PaymentsQueryResponse } from '../types';
import { useQuery } from '@apollo/client';

type Props = {
  defaultValue: string[];
  isRequired?: boolean;
  description?: string;
  onChange: (value: string[]) => void;
};

const SelectPaymentsContainer = (props: ChildProps<Props>) => {
  const [paymentIds, setPaymentIds] = React.useState<string[]>([]);

  const paymentsQuery = useQuery<PaymentsQueryResponse>(queries.payments, {
    variables: { status: 'active' },
  });

  if (paymentsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const payments = (paymentsQuery.data && paymentsQuery.data.payments) || [];

  const updatedProps = {
    ...props,
    payments,
  };

  return <SelectPayments {...updatedProps} />;
};

export default SelectPaymentsContainer;
