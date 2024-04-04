import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, withProps, router } from '@erxes/ui/src/utils';
import { Bulk, Spinner } from '@erxes/ui/src/components';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { queries as campaignQueries } from '../../../configs/assignmentCampaign/graphql';
import { AssignmentCampaignDetailQueryResponse } from '../../../configs/assignmentCampaign/types';
import {
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  assignmentsMainQuery: MainQueryResponse;
  assignmentCampaignDetailQuery: AssignmentCampaignDetailQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class AssignmentListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const {
      assignmentsMainQuery,
      assignmentCampaignDetailQuery,
      assignmentsRemove,
      history
    } = this.props;

    if (
      assignmentsMainQuery.loading ||
      (assignmentCampaignDetailQuery && assignmentCampaignDetailQuery.loading)
    ) {
      return <Spinner />;
    }

    const removeAssignments = ({ assignmentIds }, emptyBulk) => {
      assignmentsRemove({
        variables: { _ids: assignmentIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a assignment');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      assignmentsMainQuery.assignmentsMain || {};
    const currentCampaign =
      assignmentCampaignDetailQuery &&
      assignmentCampaignDetailQuery.assignmentCampaignDetail;

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      assignments: list,
      currentCampaign,
      removeAssignments
    };

    const assignmentsList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.assignmentsMainQuery.refetch();
    };

    return <Bulk content={assignmentsList} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  campaignId: queryParams.campaignId,
  status: queryParams.status,
  ownerId: queryParams.ownerId,
  ownerType: queryParams.ownerType,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined
});

const generateOptions = () => ({
  refetchQueries: [
    'assignmentsMain',
    'assignmentCounts',
    'assignmentCategories',
    'assignmentCategoriesTotalCount'
  ]
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse>(
      gql(queries.assignmentsMain),
      {
        name: 'assignmentsMainQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, AssignmentCampaignDetailQueryResponse>(
      gql(campaignQueries.assignmentCampaignDetail),
      {
        name: 'assignmentCampaignDetailQuery',
        options: ({ queryParams }) => ({
          variables: {
            _id: queryParams.campaignId
          }
        }),
        skip: ({ queryParams }) => !queryParams.campaignId
      }
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.assignmentsRemove),
      {
        name: 'assignmentsRemove',
        options: generateOptions
      }
    )
  )(withRouter<IRouterProps>(AssignmentListContainer))
);
