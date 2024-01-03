import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Bulk } from '@erxes/ui/src/components';
import { Alert, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import DonateCampaign from '../components/List';
import { mutations, queries } from '../graphql';
import {
  DonateCampaignQueryResponse,
  DonateCampaignRemoveMutationResponse,
  DonateCampaignsCountQueryResponse
} from '../types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  donateCampaignQuery: DonateCampaignQueryResponse;
  donateCampaignQueryCount: DonateCampaignsCountQueryResponse;
} & Props &
  DonateCampaignRemoveMutationResponse;

class DonateCampaignContainer extends React.Component<FinalProps> {
  render() {
    const {
      donateCampaignQuery,
      donateCampaignQueryCount,
      queryParams,
      donateCampaignsRemove
    } = this.props;

    // remove action
    const remove = ({ donateCampaignIds }, emptyBulk) => {
      donateCampaignsRemove({
        variables: { _ids: donateCampaignIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.donateCampaignsRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';

    const donateCampaigns = donateCampaignQuery.donateCampaigns || [];
    const totalCount = donateCampaignQueryCount.donateCampaignsCount || 0;

    const updatedProps = {
      ...this.props,
      queryParams,
      donateCampaigns,
      remove,
      loading: donateCampaignQuery.loading,
      searchValue,
      filterStatus,
      totalCount
    };

    const productList = props => (
      <DonateCampaign {...updatedProps} {...props} />
    );

    const refetch = () => {
      this.props.donateCampaignQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['donateCampaigns'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, DonateCampaignQueryResponse>(
      gql(queries.donateCampaignsCount),
      {
        name: 'donateCampaignQueryCount',
        options: ({ queryParams }: Props) => ({
          variables: {
            searchValue: queryParams.searchValue
          }
        })
      }
    ),
    graphql<Props, DonateCampaignQueryResponse>(gql(queries.donateCampaigns), {
      name: 'donateCampaignQuery',
      options: ({ queryParams }: Props) => ({
        variables: {
          searchValue: queryParams.searchValue,
          ...generatePaginationParams(queryParams)
        }
      })
    }),
    graphql<
      Props,
      DonateCampaignRemoveMutationResponse,
      { donateCampaignIds: string[] }
    >(gql(mutations.donateCampaignsRemove), {
      name: 'donateCampaignsRemove',
      options
    })
  )(DonateCampaignContainer)
);
