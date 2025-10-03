import { useMutation } from '@apollo/client';
import { CALL_CUSTOMER_ADD } from '../graphql/mutations/callMutations';

import { toast } from 'erxes-ui';
import { useState } from 'react';
import { ICustomer } from '@/integrations/call/types/callTypes';

export const useAddCallCustomer = () => {
  const [createCustomerMutation, { loading }] = useMutation(CALL_CUSTOMER_ADD);
  const [customer, setCustomer] = useState<any>({} as ICustomer);

  const [channels, setChannels] = useState<any>();
  const addCustomer = (
    inboxId: string,
    phoneNumber: string,
    queueName: any,
  ) => {
    createCustomerMutation({
      variables: {
        inboxIntegrationId: inboxId,
        primaryPhone: phoneNumber,
        queueName: queueName || '',
      },
    })
      .then(({ data }: any) => {
        if (data?.callAddCustomer?.customer) {
          setCustomer(data.callAddCustomer.customer);
          setChannels(data.callAddCustomer.channels);
        }
      })
      .catch((e) => {
        toast({
          title: 'Uh oh! Something went wrong',
          description: e.message,
          variant: 'destructive',
        });
      });
  };

  return {
    addCustomer,
    customer,
    channels,
    loading,
  };
};
