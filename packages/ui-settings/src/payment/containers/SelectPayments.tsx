import Spinner from '@erxes/ui/src/components/Spinner';
import { IFormProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';
import { ChildProps, graphql } from 'react-apollo';

import SelectPayments from '../components/SelectPayments';
import { queries } from '../graphql';
import { PaymentsQueryResponse } from '../types';

type Props = {
  onChange: (values: string[]) => void;
  defaultValue: string[];
  isRequired?: boolean;
  formProps: IFormProps;
  description?: string;
};

type FinalProps = {
  paymentsQuery: PaymentsQueryResponse;
} & Props;

const SelectPaymentsContainer = (props: ChildProps<FinalProps>) => {
  const { paymentsQuery } = props;

  const payments = paymentsQuery.paymentConfigs || [];

  if (paymentsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    ...props,
    payments
  };

  return <SelectPayments {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: queries.paymentsQuery,
      variables: {
        status: 'active'
      }
    }
  ];
};

export default compose(
  graphql<PaymentsQueryResponse>(queries.paymentsQuery, {
    name: 'paymentsQuery',
    options: () => ({
      refetchQueries: getRefetchQueries
    })
  })
)(SelectPaymentsContainer);
