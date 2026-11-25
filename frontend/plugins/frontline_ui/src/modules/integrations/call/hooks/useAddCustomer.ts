import { useMutation } from '@apollo/client';
import { CALL_CUSTOMER_ADD } from '../graphql/mutations/callMutations';

import { toast } from 'erxes-ui';
import { useCallback, useRef, useState } from 'react';
import { ICallChannels, ICustomer } from '@/integrations/call/types/callTypes';
import { useTranslation } from 'react-i18next';

export const useAddCallCustomer = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const [createCustomerMutation, { loading }] = useMutation(CALL_CUSTOMER_ADD);
  const [customer, setCustomer] = useState<Partial<ICustomer>>({});
  const [channels, setChannels] = useState<ICallChannels>();
  const [integrationName, setIntegrationName] = useState<string>('');
  const requestIdRef = useRef(0);

  const addCustomer = useCallback(
    (inboxId: string, phoneNumber: string, queueName?: string | null) => {
      // Each call starts blank, and only the latest lookup may fill it in.
      const requestId = ++requestIdRef.current;
      setCustomer({});
      setChannels(undefined);
      setIntegrationName('');

      createCustomerMutation({
        variables: {
          inboxIntegrationId: inboxId,
          primaryPhone: phoneNumber,
          queueName: queueName || '',
        },
      })
        .then(({ data }) => {
          if (requestId !== requestIdRef.current) return;
          if (data?.callAddCustomer?.customer) {
            setCustomer(data.callAddCustomer.customer);
            setChannels(data.callAddCustomer.channels);
          }
          setIntegrationName(data?.callAddCustomer?.integration?.name || '');
        })
        .catch((e) => {
          if (requestId !== requestIdRef.current) return;
          toast({
            title: t('something-went-wrong'),
            description: e.message,
            variant: 'destructive',
          });
        });
    },
    [createCustomerMutation, t],
  );

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
