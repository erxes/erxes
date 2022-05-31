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
  const a = useQuery(gql(queries.products));

  const data = a.data ? a.data.getProducts : [];

  return <SaleLogDetails data={a.data ? a.data.products : []} />;
}
export default SaleLogDetailsContainer;
