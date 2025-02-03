import { gql, useQuery } from '@apollo/client';
import { Spinner } from '@erxes/ui/src/components';
import React from 'react';
import queries from '../../../configs/scoreCampaign/graphql/queries';
import { ScoreCampaignsQueryResponse } from '../../../configs/scoreCampaign/types';
import List from '../components/CampaignList';

type Props = { queryParams: any };

const CampaignList = (props: Props) => {
  const { data, loading, refetch } = useQuery<ScoreCampaignsQueryResponse>(
    gql(queries.scoreCampaigns),
  );

  if (loading) {
    return <Spinner />;
  }
  const scoreCampaigns = data?.scoreCampaigns || [];

  const updatedProps = {
    ...props,
    scoreCampaigns,
    refetch: refetch,
    loading: loading,
  };

  return <List {...updatedProps} />;
};

export default CampaignList;
