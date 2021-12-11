import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Spinner, Alert, withProps, Bulk } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import DonateCompaign from '../components/List';
import { mutations, queries } from '../graphql';
import { IDonateCompaign, DonateCompaignQueryResponse, DonateCompaignRemoveMutationResponse } from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  donateCompaignQuery: DonateCompaignQueryResponse;
} & Props & DonateCompaignRemoveMutationResponse;

class DonateCompaignContainer extends React.Component<FinalProps> {
  render() {
    const {
      donateCompaignQuery,
      queryParams,
      donateCompaignsRemove
    } = this.props;

    // remove action
    const remove = ({ donateCompaignIds }, emptyBulk) => {
      donateCompaignsRemove({
        variables: { _ids: donateCompaignIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.donateCompaignsRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';

    const donateCompaigns = donateCompaignQuery.donateCompaigns || [];

    const updatedProps = {
      ...this.props,
      queryParams,
      donateCompaigns,
      remove,
      loading: donateCompaignQuery.loading,
      searchValue,
      filterStatus
    };

    const productList = props => (
      <DonateCompaign {...updatedProps} {...props} />
    );

    const refetch = () => {
      this.props.donateCompaignQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return [
    'donateCompaigns'
  ];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<{}>(
  compose(
    graphql<{}, DonateCompaignQueryResponse>(gql(queries.donateCompaigns), {
      name: 'donateCompaignQuery'
    }),
    graphql<Props, DonateCompaignRemoveMutationResponse, { donateCompaignIds: string[] }>(
      gql(mutations.donateCompaignsRemove),
      {
        name: 'donateCompaignsRemove',
        options
      }
    ),
  )(DonateCompaignContainer)
);
