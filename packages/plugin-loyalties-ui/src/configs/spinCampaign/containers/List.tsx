import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Bulk } from '@erxes/ui/src/components';
import { Alert, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import SpinCampaign from '../components/List';
import { mutations, queries } from '../graphql';
import {
  SpinCampaignQueryResponse,
  SpinCampaignRemoveMutationResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  spinCampaignQuery: SpinCampaignQueryResponse;
} & Props &
  SpinCampaignRemoveMutationResponse;

class SpinCampaignContainer extends React.Component<FinalProps> {
  render() {
    const { spinCampaignQuery, queryParams, spinCampaignsRemove } = this.props;

    // remove action
    const remove = ({ spinCampaignIds }, emptyBulk) => {
      spinCampaignsRemove({
        variables: { _ids: spinCampaignIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.spinCampaignsRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';

    const spinCampaigns = spinCampaignQuery.spinCampaigns || [];

    const updatedProps = {
      ...this.props,
      queryParams,
      spinCampaigns,
      remove,
      loading: spinCampaignQuery.loading,
      searchValue,
      filterStatus
    };

    const productList = props => <SpinCampaign {...updatedProps} {...props} />;

    const refetch = () => {
      this.props.spinCampaignQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['spinCampaigns'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<{}, SpinCampaignQueryResponse>(gql(queries.spinCampaigns), {
      name: 'spinCampaignQuery'
    }),
    graphql<
      Props,
      SpinCampaignRemoveMutationResponse,
      { spinCampaignIds: string[] }
    >(gql(mutations.spinCampaignsRemove), {
      name: 'spinCampaignsRemove',
      options
    })
  )(SpinCampaignContainer)
);
