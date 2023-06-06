import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Bulk } from '@erxes/ui/src/components';
import { Alert, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import VoucherCampaign from '../components/List';
import { mutations, queries } from '../graphql';
import {
  VoucherCampaignQueryResponse,
  VoucherCampaignRemoveMutationResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  voucherCampaignQuery: VoucherCampaignQueryResponse;
} & Props &
  VoucherCampaignRemoveMutationResponse;

class VoucherCampaignContainer extends React.Component<FinalProps> {
  render() {
    const {
      voucherCampaignQuery,
      queryParams,
      voucherCampaignsRemove
    } = this.props;

    // remove action
    const remove = ({ voucherCampaignIds }, emptyBulk) => {
      voucherCampaignsRemove({
        variables: { _ids: voucherCampaignIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.voucherCampaignsRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';

    const voucherCampaigns = voucherCampaignQuery.voucherCampaigns || [];

    const updatedProps = {
      ...this.props,
      queryParams,
      voucherCampaigns,
      remove,
      loading: voucherCampaignQuery.loading,
      searchValue,
      filterStatus
    };

    const productList = props => (
      <VoucherCampaign {...updatedProps} {...props} />
    );

    const refetch = () => {
      this.props.voucherCampaignQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['voucherCampaigns'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<{}, VoucherCampaignQueryResponse>(gql(queries.voucherCampaigns), {
      name: 'voucherCampaignQuery'
    }),
    graphql<
      Props,
      VoucherCampaignRemoveMutationResponse,
      { voucherCampaignIds: string[] }
    >(gql(mutations.voucherCampaignsRemove), {
      name: 'voucherCampaignsRemove',
      options
    })
  )(VoucherCampaignContainer)
);
