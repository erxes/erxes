import Spinner from '@erxes/ui/src/components/Spinner';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql, ChildProps } from '@apollo/client/react/hoc';
import { useQuery, useMutation } from '@apollo/client';
import SelectPayments from '../components/SelectPayments';
import { mutations, queries } from '../graphql';
import { PaymentsQueryResponse } from '../types';

type Props = {
  isRequired?: boolean;
  description?: string;
  contentType: string;
  contentTypeId?: string;
  isSubmitted?: boolean;

  afterSave?: () => void;
};

const SelectPaymentsContainer = (props: Props) => {
  const [paymentIds, setPaymentIds] = React.useState<string[]>([]);

  const { data, loading, error } = useQuery<PaymentsQueryResponse>(
    queries.payments,
    {
      fetchPolicy: 'network-only',
      variables: {
        status: 'active'
      }
    }
  );

  const { data: currentConfigData, loading: currentConfigLoading } = useQuery(
    queries.paymentConfigQuery,
    {
      variables: {
        contentType: props.contentType,
        contentTypeId: props.contentTypeId
      }
    }
  );

  const [addMutation] = useMutation(mutations.paymentConfigsAdd);
  const [editMutation] = useMutation(mutations.paymentConfigsEdit);

  if (loading || currentConfigLoading) {
    return <Spinner objective={true} />;
  }

  const payments = (data && data.payments) || [];
  const currentConfig =
    (currentConfigData && currentConfigData.getPaymentConfig) || null;

  const save = () => {
    if (currentConfig) {
      return editMutation({
        variables: {
          _id: currentConfig._id,
          paymentIds
        }
      }).then(() => {
        if (props.afterSave) {
          props.afterSave();
        }
      });
    }

    return addMutation({
      variables: {
        contentType: props.contentType,
        contentTypeId: props.contentTypeId,
        paymentIds
      }
    }).then(() => {
      if (props.afterSave) {
        props.afterSave();
      }
    });
  };

  const updatedProps = {
    ...props,
    payments,
    currentConfig,
    selectedPaymentIds: paymentIds,
    setPaymentIds,
    save
  };

  return <SelectPayments {...updatedProps} />;
};

export default SelectPaymentsContainer;
