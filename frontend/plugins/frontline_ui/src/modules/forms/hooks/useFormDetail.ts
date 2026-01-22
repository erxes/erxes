import { useQuery } from '@apollo/client';
import { IForm } from '../types/formTypes';
import { GET_FORM_DETAIL } from '../graphql/formQueries';

export const useFormDetail = ({ formId }: { formId: string }) => {
  const { data, loading } = useQuery<{
    formDetail: IForm;
  }>(GET_FORM_DETAIL, {
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
