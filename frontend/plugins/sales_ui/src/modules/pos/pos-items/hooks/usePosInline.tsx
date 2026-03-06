import { QueryHookOptions, useQuery, gql } from '@apollo/client';
import { posCommonFields } from '../graphql/queries/posQuery';

export interface IPosInline {
  _id: string;
  name: string;
  code: string;
}

export interface IPosInlineQuery {
  posDetail: IPosInline;
}

const POS_DETAIL_QUERY = gql`
  query posDetail($_id: String!) {
    posDetail(_id: $_id) {
      ${posCommonFields}
    }
  }
`;

export const usePosInline = (options?: QueryHookOptions<IPosInlineQuery>) => {
  const { data, loading, error } = useQuery<IPosInlineQuery>(POS_DETAIL_QUERY, {
    ...options,
  });

  return {
    posDetail: data?.posDetail,
    loading,
    error,
  };
};
