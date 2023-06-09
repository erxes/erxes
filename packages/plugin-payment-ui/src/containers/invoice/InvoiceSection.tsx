import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import { useQuery } from '@apollo/client';

import InvoiceSection from '../../components/invoice/InvoiceSection';
import { queries } from '../../graphql';
import { InvoicesQueryResponse } from '../../types';

type Props = {
  dealId: string;
};

function InvoiceSecitonContainer(props: Props) {
  const { dealId } = props;

  const invoicesQuery = useQuery<InvoicesQueryResponse>(queries.invoices, {
    variables: { contentType: 'cards:deals', contentTypeId: dealId },
    fetchPolicy: 'network-only'
  });

  if (invoicesQuery.loading) {
    return <Spinner />;
  }

  const onReload = () => {
    invoicesQuery.refetch();
  };

  const invoices = (invoicesQuery.data && invoicesQuery.data.invoices) || [];

  const updatedProps = {
    ...props,
    invoices,
    onReload
  };

  return <InvoiceSection {...updatedProps} />;
}

export default ({ id }: { id: string }) => {
  return <InvoiceSecitonContainer dealId={id} />;
};
