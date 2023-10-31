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
  LotteryCampaignRemoveMutationResponse,
  LotteryCampaignsCountQueryResponse
} from '../types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  lotteryCampaignQuery: LotteryCampaignQueryResponse;
  lotteryCampaignQueryCount: LotteryCampaignsCountQueryResponse;
} & Props &
  LotteryCampaignRemoveMutationResponse;

class LotteryCampaignContainer extends React.Component<FinalProps> {
  render() {
    const {
      lotteryCampaignQuery,
      lotteryCampaignQueryCount,
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
    const totalCount = lotteryCampaignQueryCount.lotteryCampaignsCount || 0;

    const updatedProps = {
      ...this.props,
      queryParams,
      lotteryCampaigns,
      remove,
      loading: lotteryCampaignQuery.loading,
      searchValue,
      totalCount,
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
    graphql<Props>(gql(queries.lotteryCampaignsCount), {
      name: 'lotteryCampaignQueryCount',
      options: ({ queryParams }: Props) => ({
        variables: {
          searchValue: queryParams.searchValue
        }
      })
    }),
    graphql<Props, LotteryCampaignQueryResponse>(
      gql(queries.lotteryCampaigns),
      {
        name: 'lotteryCampaignQuery',
        options: ({ queryParams }: Props) => ({
          variables: {
            searchValue: queryParams.searchValue,
            ...generatePaginationParams(queryParams)
          }
        })
      }
    ),
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
