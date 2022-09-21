import Payments from '../components/Payments';
import { gql, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';


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

function useContainer() {

  const { data = {} as any, loading } = useQuery(configsQuery);
  const params = useParams();

  if (loading) {
    return null;
  }
  return <Payments datas={data.paymentConfigs} />;
}

export default useContainer;
