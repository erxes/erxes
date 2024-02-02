import { Alert } from '@erxes/ui/src';
import { RemoveMutationResponse } from '../types';

import { IActivityLog } from '@erxes/ui-log/src/activityLogs/types';
import PerInvoice from '../components/PerInvoice';
import React from 'react';
import { useMutation, gql } from '@apollo/client';
import { mutations } from '../graphql';

type Props = {
  activity: IActivityLog;
};

const InvoiceListContainer = (props: Props) => {
  const { activity } = props;

  const [invoicesRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.invoicesRemove),
  );

  const removeInvoices = ({ invoiceIds }) => {
    invoicesRemove({
      variables: { invoiceIds },
    })
      .then(() => {
        Alert.success('You successfully deleted a invoice');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    removeInvoices,
    contractId: activity.content.contractId,
  };

  return <PerInvoice {...updatedProps} />;
};

export default InvoiceListContainer;
