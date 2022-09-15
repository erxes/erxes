import Payments from '../components/Payments';
import { gql, useQuery } from '@apollo/client';

const configsQuery = gql`
  query paymentConfigs {
    paymentConfigs {
      _id
      name
    }
  }
`;

function Container() {
  const { data = {} as any } = useQuery(configsQuery);

  return <Payments data={data} />;
}

export default Container;
