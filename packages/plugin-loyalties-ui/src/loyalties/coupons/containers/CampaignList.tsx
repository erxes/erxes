import { gql, useQuery } from '@apollo/client';
import { Spinner } from '@erxes/ui/src/components';
import React from 'react';
import queries from '../../../configs/couponCampaign/graphql/queries';
import List from '../components/CampaignList';

type Props = { queryParams: any };

const CampaignList = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.couponCampaigns));

  if (loading) {
    return <Spinner />;
  }
  const couponCampaigns = data?.couponCampaigns || [];

  const updatedProps = {
    ...props,
    couponCampaigns,
    loading: loading,
  };

  return <List {...updatedProps} />;
};

export default CampaignList;
