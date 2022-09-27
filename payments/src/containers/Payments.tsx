import { gql, useQuery } from '@apollo/client';
import { Buffer } from 'buffer';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

import Payments from '../components/Payments';
import { queries } from '../graphql';
import { IRouterProps } from '../types';

const PaymentsContainer = (props: IRouterProps) => {
  const { history } = props;
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  const base64str = queryParams.q;
  const parsedData: string = Buffer.from(
    base64str as string,
    'base64'
  ).toString('ascii');
  const query = JSON.parse(parsedData);

  console.log('payments container: ', query);

  const { data = {} as any, loading } = useQuery(gql(queries.paymentConfigs), {
    variables: { paymentIds: query.paymentIds },
  });

  console.log('loading: ', loading);

  if (loading) {
    return null;
  }

  return <Payments datas={data.paymentConfigs} queryParams={queryParams} />;
};

export default withRouter<IRouterProps>(PaymentsContainer);
