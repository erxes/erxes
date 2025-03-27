import { gql, useMutation, useQuery } from '@apollo/client';
import { Bulk } from '@erxes/ui/src/components';
import { Alert } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import List from '../components/List';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
};

const ListContainer = (props: Props) => {
  const { queryParams } = props;

  const [couponCampaignsRemove] = useMutation(
    gql(mutations.couponCampaignsRemove),
    {
      refetchQueries: ['couponCampaigns'],
    },
  );

  const { data, loading, refetch } = useQuery(gql(queries.couponCampaigns), {
    variables: {
      searchValue: queryParams.searchValue,
      ...generatePaginationParams(queryParams),
    },
  });

  const remove = ({ couponCampaignIds }, emptyBulk) => {
    console.log('couponCampaignIds', couponCampaignIds);

    couponCampaignsRemove({
      variables: { ids: couponCampaignIds },
    })
      .then((removeStatus) => {
        emptyBulk();

        removeStatus.data.couponCampaignsRemove.deletedCount
          ? Alert.success('You successfully deleted a campaign')
          : Alert.warning('Campaign status deleted');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const { couponCampaigns = [] } = data || {};

  const updatedProps = {
    ...props,
    couponCampaigns,
    loading,
    remove,
  };

  const campaignList = (props) => <List {...updatedProps} {...props} />;

  return <Bulk content={campaignList} refetch={refetch} />;
};

export default ListContainer;
