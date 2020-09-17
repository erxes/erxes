import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'modules/common/types';
import { generatePaginationParams } from 'modules/common/utils/router';
import { IEmailDelivery } from 'modules/engage/types';
import * as React from 'react';
import { graphql } from 'react-apollo';
import EmailDelivery from '../components/EmailDelivery';
import queries from '../queries';

type transactionDeliveriesQueryResponse = {
  transactionEmailDeliveries: {
    list: IEmailDelivery[];
    totalCount: number;
    loading: boolean;
  };
};

type Props = {
  queryParams: any;
} & IRouterProps;

type FinalProps = {
  transactionDeliveriesQuery: transactionDeliveriesQueryResponse;
} & Props;

function EmailDeliveryContainer(props: FinalProps) {
  const {
    transactionDeliveriesQuery: { transactionEmailDeliveries = {} }
  }: any = props;

  const transactionDeliveries = transactionEmailDeliveries.list || [];
  const totalCount = transactionEmailDeliveries.totalCount || 0;

  const updatedProps = {
    ...props,
    count: totalCount,
    transactionDeliveries,
    loading: transactionEmailDeliveries.loading
  };

  return <EmailDelivery {...updatedProps} />;
}

export default compose(
  graphql<Props, transactionDeliveriesQueryResponse>(
    gql(queries.transactionEmailDeliveries),
    {
      name: 'transactionDeliveriesQuery',
      options: ({ queryParams }) => ({
        variables: {
          status: queryParams.status,
          ...generatePaginationParams(queryParams)
        }
      })
    }
  )
)(EmailDeliveryContainer);
