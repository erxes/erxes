import { QueryHookOptions } from '@apollo/client';

import { renderingCustomerDetailAtom } from '@/contacts/states/customerDetailStates';
import { useSetAtom } from 'jotai';
import { toast, useQueryState } from 'erxes-ui';
import { ICustomerDetail, useCustomerDetail } from 'ui-modules';
import { useEffect } from 'react';

export const useCustomerDetailWithQuery = (
  options?: QueryHookOptions<{ customerDetail: ICustomerDetail }>,
) => {
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
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  }, [customerDetail, loading, error]);

  return { customerDetail, loading, error };
};
