import { ITriage } from '@/triage/types/triage';
import { GET_TRIAGE } from '@/triage/graphql/queries/getTriage';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router';

export const useGetTriage = () => {
  const { id } = useParams();
  const { data, loading } = useQuery<{ operationGetTriage: ITriage }>(
    GET_TRIAGE,
    { variables: { _id: id }, skip: !id },
  );

  return {
    id,
    triage: data?.operationGetTriage,
    loading,
  };
};
