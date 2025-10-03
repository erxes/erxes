import { useQuery } from '@apollo/client';
import { GET_COMPANY_DETAIL } from '@/contacts/companies/graphql/queries/getCompanyDetail';
import { renderingCompanyDetailAtom } from '@/contacts/states/companyDetailStates';
import { useSetAtom } from 'jotai';
import { toast, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';

export const useCompanyDetailWithQuery = () => {
  const [_id] = useQueryState('companyId');
  const setRendering = useSetAtom(renderingCompanyDetailAtom);
  const { data, loading, error } = useQuery(GET_COMPANY_DETAIL, {
    variables: {
      id: _id,
    },
    skip: !_id,
  });

  useEffect(() => {
    if (data || !loading || error) {
      setRendering(false);
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  }, [data, loading, error]);

  return { companyDetail: data?.companyDetail, loading, error };
};
