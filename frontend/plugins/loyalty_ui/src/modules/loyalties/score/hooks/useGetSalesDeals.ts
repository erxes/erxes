import { useQuery } from '@apollo/client';
import { GET_SALES_DEALS } from '../graphql/salesQueries';

interface IDeal {
  _id: string;
  name: string;
  number: string;
  stageId: string;
}

export const useGetSalesDeals = ({
  pipelineId,
  stageId,
  searchValue,
  skip,
}: {
  pipelineId?: string;
  stageId?: string;
  searchValue?: string;
  skip?: boolean;
}) => {
  const { data, loading, error } = useQuery<{ salesDeals: IDeal[] }>(
    GET_SALES_DEALS,
    {
      variables: { pipelineId, stageId, searchValue: searchValue || undefined },
      skip: skip || !pipelineId,
      errorPolicy: 'all',
    },
  );
  return { deals: data?.salesDeals || [], loading, error };
};
