import { useQuery } from '@apollo/client';
import { FIELD_DETAILS_QUERY } from '../graphql/fieldsQueries';
import { IField } from '../types/fieldsTypes';

export const useFieldDetail = (id?: string) => {
  const { data, loading } = useQuery<{ fieldDetail: IField }>(
    FIELD_DETAILS_QUERY,
    {
      variables: { id },
      skip: !id,
    },
  );

  const field = data?.fieldDetail;

  return {
    field,
    loading,
  };
};
