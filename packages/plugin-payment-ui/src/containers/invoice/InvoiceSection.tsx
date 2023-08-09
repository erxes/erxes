import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import { useQuery } from '@apollo/client';

import InvoiceSection from '../../components/invoice/InvoiceSection';
import { queries } from '../../graphql';
import { InvoicesQueryResponse } from '../../types';

type Props = {
  contentType: string;
  contentTypeId: string;
};

function InvoiceSecitonContainer(props: Props) {
  const { contentType, contentTypeId } = props;

  if (!contentType || !contentTypeId) {
    return null;
  }

  const invoicesQuery = useQuery<InvoicesQueryResponse>(queries.invoices, {
    variables: { contentType, contentTypeId },
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

export default args => {
  let { contentTypeId, contentType } = args;
  const { mainType, mainTypeId } = args;
  if (['deal', 'task', 'company'].includes(mainType)) {
    contentType = `cards:${mainType}s`;
    contentTypeId = mainTypeId;
  }

  return (
    <InvoiceSecitonContainer
      contentTypeId={contentTypeId}
      contentType={contentType}
    />
  );
};
