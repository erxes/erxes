import Spinner from '@erxes/ui/src/components/Spinner';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql, ChildProps } from '@apollo/client/react/hoc';

import SelectPayments from '../components/SelectPayments';
import { queries } from '../graphql';
import { PaymentsQueryResponse } from '../types';

type Props = {
  defaultValue: string[];
  isRequired?: boolean;
  description?: string;
  onChange: (value: string[]) => void;
};

type FinalProps = {
  paymentsQuery: PaymentsQueryResponse;
} & Props;

const SelectPaymentsContainer = (props: ChildProps<FinalProps>) => {
  const [paymentIds, setPaymentIds] = React.useState<string[]>([]);

  const { paymentsQuery } = props;

  if (paymentsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const payments = paymentsQuery.payments || [];

  const updatedProps = {
    ...props,
    payments
  };

  return <SelectPayments {...updatedProps} />;
};

export default compose(
  graphql<PaymentsQueryResponse>(queries.payments, {
    name: 'paymentsQuery',
    options: () => ({
      variables: { status: 'active' }
    })
  })
)(SelectPaymentsContainer);
