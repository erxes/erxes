import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import { queries, mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import SaleLogDetails from '../components/SaleLogDetails';

type Props = {
  id: String;
};

function SaleLogDetailsContainer({ id }: Props) {
  const a = useQuery(gql(queries.getProducts));
  console.log('teeeeest', id, a.data ? a.data.getProducts : 'sad');
  const data = a.data ? a.data.getProducts : 'sad';
  return <SaleLogDetails data={a.data ? a.data.getProducts : []} />;
}
export default SaleLogDetailsContainer;
