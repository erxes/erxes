import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import * as React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import SmsDeliveries from '../components/SmsDeliveries';
import { queries } from '../graphql/index';
import { SmsDeliveriesQueryResponse } from '../types';

type Props = {
  history: any;
  queryParams: any;
  smsDeliveriesQuery: SmsDeliveriesQueryResponse;
};

const commonOptions = qp => {
  const variables = {
    type: qp && qp.type,
    ...generatePaginationParams(qp)
  };

  return [{ query: gql(queries.smsDeliveries), variables }];
};

const List = (props: Props) => {
  const { queryParams, smsDeliveriesQuery } = props;
  const isLoading = smsDeliveriesQuery.loading;

  const updatedProps = {
    ...props,
    isLoading: smsDeliveriesQuery.loading,
    refetchQueries: commonOptions(queryParams),
    smsDeliveries: isLoading ? [] : smsDeliveriesQuery.smsDeliveries.list,
    count: isLoading ? 0 : smsDeliveriesQuery.smsDeliveries.totalCount
  };

  return <SmsDeliveries {...updatedProps} />;
};

export default compose(
  graphql<Props, SmsDeliveriesQueryResponse>(gql(queries.smsDeliveries), {
    name: 'smsDeliveriesQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      variables: {
        type: queryParams && queryParams.type ? queryParams.type : 'campaign',
        ...generatePaginationParams(queryParams)
      }
    })
  })
)(List);
