import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries as generalQueries } from 'modules/settings/general/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { ConfigDetailQueryResponse } from '../../../settings/general/types';
import PaymentForm from '../../components/product/PaymentForm';
import { IPaymentsData } from '../../types';

type Props = {
  total: { currency?: string; amount?: number };
  payments?: IPaymentsData;
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
};

type FinalProps = {
  getCurrenciesQuery: ConfigDetailQueryResponse;
} & Props;

class PaymentFormContainer extends React.Component<FinalProps> {
  render() {
    const { getCurrenciesQuery } = this.props;

    const currencies = getCurrenciesQuery.configsDetail
      ? getCurrenciesQuery.configsDetail.value
      : [];

    const extendedProps = {
      ...this.props,
      currencies
    };

    return <PaymentForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ConfigDetailQueryResponse, { code: string }>(
      gql(generalQueries.configsDetail),
      {
        name: 'getCurrenciesQuery',
        options: {
          variables: {
            code: 'dealCurrency'
          }
        }
      }
    )
  )(PaymentFormContainer)
);
