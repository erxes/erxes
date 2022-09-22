import { gql, useQuery } from '@apollo/client';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

import Payments from '../components/Payments';
import { IRouterProps } from '../types';

const configsQuery = gql`
  query paymentConfigs {
    paymentConfigs {
      _id
      name
      type
      status
      config
    }
  }
`;

const PaymentsContainer = (props: IRouterProps) => {
  const { data = {} as any, loading } = useQuery(configsQuery);

  const { history } = props;

  const { location } = history;
  const queryParams = queryString.parse(location.search);

  console.log('queryParams: ', queryParams);

  if (loading) {
    return null;
  }

  return <Payments datas={data.paymentConfigs} />;
};

export default withRouter<IRouterProps>(PaymentsContainer);
