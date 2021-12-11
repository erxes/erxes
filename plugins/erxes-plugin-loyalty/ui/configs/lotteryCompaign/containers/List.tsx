import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Spinner, Alert, withProps, Bulk } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import LotteryCompaign from '../components/List';
import { mutations, queries } from '../graphql';
import { ILotteryCompaign, LotteryCompaignQueryResponse, LotteryCompaignRemoveMutationResponse } from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  lotteryCompaignQuery: LotteryCompaignQueryResponse;
} & Props & LotteryCompaignRemoveMutationResponse;

class LotteryCompaignContainer extends React.Component<FinalProps> {
  render() {
    const {
      lotteryCompaignQuery,
      queryParams,
      lotteryCompaignsRemove
    } = this.props;

    // remove action
    const remove = ({ lotteryCompaignIds }, emptyBulk) => {
      lotteryCompaignsRemove({
        variables: { _ids: lotteryCompaignIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.lotteryCompaignsRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';

    const lotteryCompaigns = lotteryCompaignQuery.lotteryCompaigns || [];

    const updatedProps = {
      ...this.props,
      queryParams,
      lotteryCompaigns,
      remove,
      loading: lotteryCompaignQuery.loading,
      searchValue,
      filterStatus
    };

    const productList = props => (
      <LotteryCompaign {...updatedProps} {...props} />
    );

    const refetch = () => {
      this.props.lotteryCompaignQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return [
    'lotteryCompaigns'
  ];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<{}>(
  compose(
    graphql<{}, LotteryCompaignQueryResponse>(gql(queries.lotteryCompaigns), {
      name: 'lotteryCompaignQuery'
    }),
    graphql<Props, LotteryCompaignRemoveMutationResponse, { lotteryCompaignIds: string[] }>(
      gql(mutations.lotteryCompaignsRemove),
      {
        name: 'lotteryCompaignsRemove',
        options
      }
    ),
  )(LotteryCompaignContainer)
);
