import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Spinner, Alert, withProps, Bulk } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import SpinCompaign from '../components/List';
import { mutations, queries } from '../graphql';
import { ISpinCompaign, SpinCompaignQueryResponse, SpinCompaignRemoveMutationResponse } from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  spinCompaignQuery: SpinCompaignQueryResponse;
} & Props & SpinCompaignRemoveMutationResponse;

class SpinCompaignContainer extends React.Component<FinalProps> {
  render() {
    const {
      spinCompaignQuery,
      queryParams,
      spinCompaignsRemove
    } = this.props;

    // remove action
    const remove = ({ spinCompaignIds }, emptyBulk) => {
      spinCompaignsRemove({
        variables: { _ids: spinCompaignIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.spinCompaignsRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';

    const spinCompaigns = spinCompaignQuery.spinCompaigns || [];

    const updatedProps = {
      ...this.props,
      queryParams,
      spinCompaigns,
      remove,
      loading: spinCompaignQuery.loading,
      searchValue,
      filterStatus
    };

    const productList = props => (
      <SpinCompaign {...updatedProps} {...props} />
    );

    const refetch = () => {
      this.props.spinCompaignQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return [
    'spinCompaigns'
  ];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<{}>(
  compose(
    graphql<{}, SpinCompaignQueryResponse>(gql(queries.spinCompaigns), {
      name: 'spinCompaignQuery'
    }),
    graphql<Props, SpinCompaignRemoveMutationResponse, { spinCompaignIds: string[] }>(
      gql(mutations.spinCompaignsRemove),
      {
        name: 'spinCompaignsRemove',
        options
      }
    ),
  )(SpinCompaignContainer)
);
