import { QueryHookOptions, useQuery } from '@apollo/client';
import { QUERY_LOTTERY_CAMPAIGNS } from '../../settings/lottery/add-lottery-campaign/graphql/queries/getCampaignsQuery';

export interface ILotteryCampaignInline {
  _id: string;
  title: string;
  description?: string;
  status?: string;
}

export interface ILotteryCampaignInlineQuery {
  lotteryCampaigns: { list: ILotteryCampaignInline[] };
}

export const useLotteryCampaignInline = (
  options?: QueryHookOptions<ILotteryCampaignInlineQuery>,
) => {
  const { data, loading, error } = useQuery<ILotteryCampaignInlineQuery>(
    QUERY_LOTTERY_CAMPAIGNS,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
    },
  );

  return {
    campaignDetail: data?.lotteryCampaigns?.list?.[0],
    loading,
    error,
  };
};
