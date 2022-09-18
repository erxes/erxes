import Payments from '../components/Payments';
import { gql, useQuery } from '@apollo/client';

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

function Container() {
  const { data = {} as any, loading } = useQuery(configsQuery);

  if (loading) {
    return null;
  }

  return <Payments datas={data.paymentConfigs} />;
}

export default Container;
