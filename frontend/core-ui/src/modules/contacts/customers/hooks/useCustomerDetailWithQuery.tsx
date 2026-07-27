import { QueryHookOptions } from '@apollo/client';

import { renderingCustomerDetailAtom } from '@/contacts/states/customerDetailStates';
import { useSetAtom } from 'jotai';
import { toast, useQueryState } from 'erxes-ui';
import { ICustomerDetail, useCustomerDetail } from 'ui-modules';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useCustomerDetailWithQuery = (
  options?: QueryHookOptions<{ customerDetail: ICustomerDetail }>,
) => {
  const { t } = useTranslation('contact');
  const [_id] = useQueryState('contactId');
  const setRendering = useSetAtom(renderingCustomerDetailAtom);

  const { customerDetail, loading, error } = useCustomerDetail({
    ...options,
    variables: {
      _id,
    },
    skip: !_id,
  });

  useEffect(() => {
    if (customerDetail || !loading || error) {
      setRendering(false);
      if (error) {
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  }, [customerDetail, loading, error]);

  return { customerDetail, loading, error };
};
