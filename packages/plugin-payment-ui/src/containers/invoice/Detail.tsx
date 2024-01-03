import React from 'react';
import { useQuery } from '@apollo/client';
import queries from '../../graphql/queries';
import Spinner from '@erxes/ui/src/components/Spinner';
import Detail from '../../components/invoice/Detail';

type Props = {
  id: string;
};

const Container = (props: Props) => {
  const { data, loading } = useQuery(queries.getInvoice, {
    variables: {
      _id: props.id
    }
  });

  if (loading) {
    return <Spinner />;
  }

  return <Detail invoice={data.invoiceDetail} />;
};

export default Container;
