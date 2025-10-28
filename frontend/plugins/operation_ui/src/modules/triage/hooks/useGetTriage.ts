import { ITriage } from '@/triage/types/triage';
import { GET_TRIAGE } from '@/triage/graphql/queries/getTriage';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router';

export const useGetTriage = () => {
  const { triageId } = useParams();
  const { data, loading } = useQuery<{ operationGetTriage: ITriage }>(
    GET_TRIAGE,
    { variables: { _id: triageId }, skip: !triageId },
  );

  return {
    triageId,
    triage: data?.operationGetTriage,
    loading,
  };
};
