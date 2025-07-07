import React from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import SelectCustomer from '../components/SelectCustomer';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  inboxId: string;
  closeModal: () => void;
  phoneNumber: string;
  conversationId: string;
};

const SelectCustomerContainer = (props: Props) => {
  const { inboxId, closeModal, phoneNumber, conversationId } = props;

  const { data, loading: customersLoading } = useQuery(
    gql(queries.callCustomers),
    {
      variables: {
        phoneNumber,
      },
      pollInterval: 8000,
    },
  );

  const [selectCustomer, { loading: selectCustomerLoading }] = useMutation(
    gql(mutations.callSelectCustomer),
    {
      refetchQueries: ['callCustomers'],
    },
  );

  const handleSelectCustomer = async (customerId: string) => {
    const selectedCustomer = data?.callCustomers?.find(
      (customer) => customer._id === customerId,
    );

    if (!selectedCustomer) {
      Alert.error('Customer not found');
      return;
    }
    try {
      const response = await selectCustomer({
        variables: {
          integrationId: inboxId,
          customerId: customerId,
          phoneNumber: phoneNumber,
          conversationId,
        },
      });

      if (response.data?.callSelectCustomer === 'failed') {
        Alert.error('Failed to save customer');
      } else {
        Alert.success(`Save to customer ${selectedCustomer.firstName}`);
        closeModal();
      }
    } catch (error: any) {
      Alert.error(error.message || 'Failed to save customer');
    }
  };

  const handleCloseModal = () => {
    closeModal();
  };

  if (customersLoading || selectCustomerLoading) {
    return <Spinner objective={true} />;
  }
  const customersList = data?.callCustomers || [];

  return (
    <SelectCustomer
      customers={customersList}
      onSelectCustomer={handleSelectCustomer}
      closeModal={handleCloseModal}
    />
  );
};

export default SelectCustomerContainer;
