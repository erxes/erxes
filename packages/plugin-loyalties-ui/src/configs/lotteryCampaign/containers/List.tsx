import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Bulk } from '@erxes/ui/src/components';
import { Alert, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import LotteryCampaign from '../components/List';
import { mutations, queries } from '../graphql';
import {
  LotteryCampaignQueryResponse,
  LotteryCampaignRemoveMutationResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  lotteryCampaignQuery: LotteryCampaignQueryResponse;
} & Props &
  LotteryCampaignRemoveMutationResponse;

class LotteryCampaignContainer extends React.Component<FinalProps> {
  render() {
    const {
      lotteryCampaignQuery,
      queryParams,
      lotteryCampaignsRemove
    } = this.props;

    // remove action
    const remove = ({ lotteryCampaignIds }, emptyBulk) => {
      lotteryCampaignsRemove({
        variables: { _ids: lotteryCampaignIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.lotteryCampaignsRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';

    const lotteryCampaigns = lotteryCampaignQuery.lotteryCampaigns || [];

    const updatedProps = {
      ...this.props,
      queryParams,
      lotteryCampaigns,
      remove,
      loading: lotteryCampaignQuery.loading,
      searchValue,
      filterStatus
    };

    const productList = props => (
      <LotteryCampaign {...updatedProps} {...props} />
    );

    const refetch = () => {
      this.props.lotteryCampaignQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['lotteryCampaigns'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<{}, LotteryCampaignQueryResponse>(gql(queries.lotteryCampaigns), {
      name: 'lotteryCampaignQuery'
    }),
    graphql<
      Props,
      LotteryCampaignRemoveMutationResponse,
      { lotteryCampaignIds: string[] }
    >(gql(mutations.lotteryCampaignsRemove), {
      name: 'lotteryCampaignsRemove',
      options
    })
  )(LotteryCampaignContainer)
);
