import { useQuery } from '@apollo/client';
import { GET_FORM_DETAIL } from '../graphql/formQueries';

export const useFormDetail = (formId: string) => {
  const { data, loading } = useQuery(GET_FORM_DETAIL, {
    variables: {
      id: formId,
    },
    skip: !formId,
  });
  return {
    formDetail: data?.formDetail,
    loading,
  };
};
