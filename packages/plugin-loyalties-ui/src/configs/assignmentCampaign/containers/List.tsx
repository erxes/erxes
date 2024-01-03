import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Bulk, Spinner } from '@erxes/ui/src/components';
import { Alert, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import AssignmentCampaign from '../components/List';
import { mutations, queries } from '../graphql';
import {
  AssignmentCampaignQueryResponse,
  AssignmentCampaignRemoveMutationResponse,
  AssignmentCampaignsCountQueryResponse
} from '../types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  assignmentCampaignQuery: AssignmentCampaignQueryResponse;
  assignmentCampaignQueryCount: AssignmentCampaignsCountQueryResponse;
} & Props &
  AssignmentCampaignRemoveMutationResponse;

class AssignmentCampaignContainer extends React.Component<FinalProps> {
  render() {
    const {
      assignmentCampaignQuery,
      assignmentCampaignQueryCount,
      queryParams,
      assignmentCampaignsRemove
    } = this.props;

    // remove action
    const remove = ({ assignmentCampaignIds }, emptyBulk) => {
      assignmentCampaignsRemove({
        variables: { _ids: assignmentCampaignIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.assignmentCampaignsRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';

    const assignmentCampaigns =
      assignmentCampaignQuery.assignmentCampaigns || [];
    const totalCount =
      assignmentCampaignQueryCount.assignmentCampaignsCount || 0;

    const updatedProps = {
      ...this.props,
      queryParams,
      assignmentCampaigns,
      remove,
      loading: assignmentCampaignQuery.loading,
      searchValue,
      filterStatus,
      totalCount
    };

    const productList = props => (
      <AssignmentCampaign {...updatedProps} {...props} />
    );

    const refetch = () => {
      this.props.assignmentCampaignQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['assignmentCampaigns'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, AssignmentCampaignQueryResponse>(
      gql(queries.assignmentCampaignsCount),
      {
        name: 'assignmentCampaignQueryCount',
        options: ({ queryParams }: Props) => ({
          variables: {
            searchValue: queryParams.searchValue
          }
        })
      }
    ),
    graphql<Props, AssignmentCampaignQueryResponse>(
      gql(queries.assignmentCampaigns),
      {
        name: 'assignmentCampaignQuery',
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
      AssignmentCampaignRemoveMutationResponse,
      { assignmentCampaignIds: string[] }
    >(gql(mutations.assignmentCampaignsRemove), {
      name: 'assignmentCampaignsRemove',
      options
    })
  )(AssignmentCampaignContainer)
);
