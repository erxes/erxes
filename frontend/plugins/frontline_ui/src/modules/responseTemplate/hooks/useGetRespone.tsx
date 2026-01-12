import { useQuery } from '@apollo/client';
import { GET_RESPONSE } from '@/responseTemplate/graphql/queries/getResponse';
import { IResponseTemplate } from '@/responseTemplate/types';

interface IUseGetResponseResponse {
  responseTemplate: IResponseTemplate;
}

export const useGetResponse = (_id?: string) => {
  const { data, loading, error } = useQuery<IUseGetResponseResponse>(
    GET_RESPONSE,
    {
      variables: { id: _id },
      skip: !_id,
    },
  );

  return {
    response: data?.responseTemplate,
    loading,
    error,
  };
};
