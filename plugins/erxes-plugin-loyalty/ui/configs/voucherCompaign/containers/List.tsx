import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Spinner, Alert, withProps, Bulk } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import VoucherCompaign from '../components/List';
import { mutations, queries } from '../graphql';
import { IVoucherCompaign, VoucherCompaignQueryResponse, VoucherCompaignRemoveMutationResponse } from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  voucherCompaignQuery: VoucherCompaignQueryResponse;
} & Props & VoucherCompaignRemoveMutationResponse;

class VoucherCompaignContainer extends React.Component<FinalProps> {
  render() {
    const {
      voucherCompaignQuery,
      queryParams,
      voucherCompaignsRemove
    } = this.props;

    // remove action
    const remove = ({ voucherCompaignIds }, emptyBulk) => {
      voucherCompaignsRemove({
        variables: { _ids: voucherCompaignIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.voucherCompaignsRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';

    const voucherCompaigns = voucherCompaignQuery.voucherCompaigns || [];

    const updatedProps = {
      ...this.props,
      queryParams,
      voucherCompaigns,
      remove,
      loading: voucherCompaignQuery.loading,
      searchValue,
      filterStatus
    };

    const productList = props => (
      <VoucherCompaign {...updatedProps} {...props} />
    );

    const refetch = () => {
      this.props.voucherCompaignQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return [
    'voucherCompaigns'
  ];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<{}>(
  compose(
    graphql<{}, VoucherCompaignQueryResponse>(gql(queries.voucherCompaigns), {
      name: 'voucherCompaignQuery'
    }),
    graphql<Props, VoucherCompaignRemoveMutationResponse, { voucherCompaignIds: string[] }>(
      gql(mutations.voucherCompaignsRemove),
      {
        name: 'voucherCompaignsRemove',
        options
      }
    ),
  )(VoucherCompaignContainer)
);
