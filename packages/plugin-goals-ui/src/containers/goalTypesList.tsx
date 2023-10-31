import { Alert, Bulk, router, withProps } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import GoalTypesList from '../components/goalTypesList';
import { mutations, queries } from '../graphql';
import {
  ListQueryVariables,
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  goalTypesMainQuery: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class GoalTypeListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { goalTypesMainQuery, goalTypesRemove } = this.props;
    const removeGoalTypes = ({ goalTypeIds }, emptyBulk) => {
      goalTypesRemove({
        variables: { goalTypeIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a goalType');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const query = this.props.queryParams.queryParams || '';

    const { list = [], totalCount = 0 } =
      goalTypesMainQuery.goalTypesMain || {};
    const updatedProps = {
      ...this.props,
      totalCount,
      // searchValue,
      goalTypes: list,
      loading: goalTypesMainQuery.loading || this.state.loading,
      removeGoalTypes
    };

    const goalTypesList = props => {
      return <GoalTypesList {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.goalTypesMainQuery.refetch();
    };

    return <Bulk content={goalTypesList} refetch={refetch} />;
  }
}

const generateOptions = () => ({
  refetchQueries: ['goalTypesMain']
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse, ListQueryVariables>(
      gql(queries.goalTypesMain),
      {
        name: 'goalTypesMainQuery',
        options: ({ queryParams }) => {
          return {
            variables: {
              ...router.generatePaginationParams(queryParams || {}),
              date: queryParams.date,
              branch: queryParams.branch,
              department: queryParams.department,
              unit: queryParams.unit,
              contribution: queryParams.contribution,
              sortField: queryParams.sortField,
              sortDirection: queryParams.sortDirection
                ? parseInt(queryParams.sortDirection, 10)
                : undefined
            },
            fetchPolicy: 'network-only'
          };
        }
      }
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.goalTypesRemove),
      {
        name: 'goalTypesRemove',
        options: generateOptions
      }
    )
  )(withRouter<IRouterProps>(GoalTypeListContainer))
);
