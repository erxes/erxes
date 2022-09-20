import Payments from '../components/Payments';
import { gql, useQuery } from '@apollo/client';
import { useLocation } from 'react-router-dom';


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



const Container = () => {
  // const location = useLocation();
  const { data = {} as any, loading } = useQuery(configsQuery);

  if (loading) {
    return null;
  }
  return <Payments datas={data.paymentConfigs} />;
}

export default Container;
