import { useMutation } from '@apollo/client';
import { CALL_CUSTOMER_ADD } from '../graphql/mutations/callMutations';

import { toast } from 'erxes-ui';
import { useState } from 'react';
import { ICallChannels, ICustomer } from '@/integrations/call/types/callTypes';
import { useTranslation } from 'react-i18next';

export const useAddCallCustomer = () => {
  const { t } = useTranslation('frontline');
  const [createCustomerMutation, { loading }] = useMutation(CALL_CUSTOMER_ADD);
  const [customer, setCustomer] = useState<Partial<ICustomer>>({});

  const [channels, setChannels] = useState<ICallChannels>();
  const [integrationName, setIntegrationName] = useState<string>('');
  const addCustomer = (
    inboxId: string,
    phoneNumber: string,
    queueName?: string | null,
  ) => {
    createCustomerMutation({
      variables: {
        inboxIntegrationId: inboxId,
        primaryPhone: phoneNumber,
        queueName: queueName || '',
      },
    })
      .then(({ data }) => {
        if (data?.callAddCustomer?.customer) {
          setCustomer(data.callAddCustomer.customer);
          setChannels(data.callAddCustomer.channels);
        }
        setIntegrationName(data?.callAddCustomer?.integration?.name || '');
      })
      .catch((e) => {
        toast({
          title: t('something-went-wrong'),
          description: e.message,
          variant: 'destructive',
        });
      });
  };

  return {
    addCustomer,
    customer,
    channels,
    integrationName,
    loading,
  };
};

export type TAddCallCustomer = ReturnType<
  typeof useAddCallCustomer
>['addCustomer'];
