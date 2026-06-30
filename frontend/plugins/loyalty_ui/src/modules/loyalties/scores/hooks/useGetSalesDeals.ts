import { useQuery, gql } from '@apollo/client';

const GET_SALES_DEALS = gql`
  query SalesDeals(
    $search: String
    $pipelineId: String
    $stageId: String
    $limit: Int
    $orderBy: JSON
    $noSkipArchive: Boolean
  ) {
    deals(
      search: $search
      pipelineId: $pipelineId
      stageId: $stageId
      limit: $limit
      orderBy: $orderBy
      noSkipArchive: $noSkipArchive
    ) {
      list {
        _id
        name
        number
        stageId
      }
    }
  }
`;

// Surface more results, newest first, so deals from previous days are findable
// instead of being cut off by the backend's small default page (sorted by the
// manual card `order`, which buries older deals).
const DEALS_SEARCH_LIMIT = 100;
const DEALS_SEARCH_ORDER_BY = { createdAt: -1 };

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
      variables: {
        ...params,
        limit: DEALS_SEARCH_LIMIT,
        orderBy: DEALS_SEARCH_ORDER_BY,
        // Include archived deals so deals in archived stages/pipelines are
        // still findable when giving scores.
        noSkipArchive: true,
      },
      skip: !params.pipelineId && !params.stageId && !params.search,
      errorPolicy: 'all',
    },
  );
  return { deals: data?.deals?.list || [], loading, error };
};
