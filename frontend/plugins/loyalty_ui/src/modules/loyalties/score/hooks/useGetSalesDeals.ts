import { useQuery, gql } from '@apollo/client';

const GET_SALES_DEALS = gql`
  query SalesDeals($search: String, $pipelineId: String, $stageId: String) {
    deals(search: $search, pipelineId: $pipelineId, stageId: $stageId) {
      list {
        _id
        name
        number
        stageId
      }
    }
  }
`;

interface IDeal {
  _id: string;
  name: string;
  number: string;
  stageId: string;
}

interface IParams {
  search?: string;
  pipelineId?: string;
  stageId?: string;
}

export const useGetSalesDeals = (params: IParams) => {
  const { data, loading, error } = useQuery<{ deals: { list: IDeal[] } }>(
    GET_SALES_DEALS,
    {
      variables: params,
      skip: !params.pipelineId && !params.stageId,
      errorPolicy: 'all',
    },
  );
  return { deals: data?.deals?.list || [], loading, error };
};
