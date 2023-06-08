import * as compose from 'lodash.flowright';

import {
  AddMutationResponse,
  CountQueryResponse,
  IAutomationDoc,
  ListQueryVariables,
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { mutations, queries } from '../graphql';

import Bulk from '@erxes/ui/src/components/Bulk';
import { DefaultColumnsConfigQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import { IRouterProps } from '@erxes/ui/src/types';
import List from '../components/List';
import React from 'react';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

type Props = {
  queryParams?: any;
};

type FinalProps = {
  automationsMainQuery: MainQueryResponse;
  automationsTotalCountQuery: CountQueryResponse;
  automationsListConfigQuery: DefaultColumnsConfigQueryResponse;
  duplicateMutation: any;
} & Props &
  IRouterProps &
  RemoveMutationResponse &
  AddMutationResponse;

type State = {
  loading: boolean;
};

class ListContainer extends React.Component<FinalProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  refetchWithDelay = () => {
    this.timer = setTimeout(() => {
      this.props.automationsMainQuery.refetch();
    }, 5500);
  };

  render() {
    const {
      automationsMainQuery,
      automationsTotalCountQuery,
      automationsRemove,
      addAutomationMutation,
      duplicateMutation,
      history
    } = this.props;

    const counts = automationsTotalCountQuery
      ? automationsTotalCountQuery.automationsTotalCount
      : null;

    const addAutomation = () => {
      addAutomationMutation({
        variables: {
          name: 'Your automation title',
          status: 'draft',
          triggers: [],
          actions: []
        }
      })
        .then(data => {
          history.push({
            pathname: `/automations/details/${data.data.automationsAdd._id}`,
            search: '?isCreate=true'
          });
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    const removeAutomations = ({ automationIds }, emptyBulk) => {
      confirm().then(() => {
        automationsRemove({
          variables: { automationIds }
        })
          .then(() => {
            emptyBulk();
            Alert.success(
              'You successfully deleted a automation. The changes will take a few seconds',
              4500
            );

            this.refetchWithDelay();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const duplicate = _id => {
      confirm().then(() => {
        duplicateMutation({
          variables: { _id, duplicate: true }
        })
          .then(() => {
            Alert.success('You successfully duplicated a automation.');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      automationsMainQuery.automationsMain || {};

    const updatedProps = {
      ...this.props,
      counts,
      totalCount,
      searchValue,
      automations: list,
      loading: automationsMainQuery.loading || this.state.loading,
      addAutomation,
      duplicate,
      removeAutomations,
      refetch: this.refetchWithDelay
    };

    const automationsList = props => {
      return <List {...updatedProps} {...props} />;
    };

    return (
      <Bulk
        content={automationsList}
        refetch={this.props.automationsMainQuery.refetch}
      />
    );
  }
}

const generateParams = ({ queryParams }) => {
  return {
    ...generatePaginationParams(queryParams),
    status: queryParams.status,
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  };
};

export const getRefetchQueries = (queryParams?: any) => {
  return [
    {
      query: gql(queries.automationsMain),
      variables: { ...generateParams({ queryParams }) }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, MainQueryResponse, ListQueryVariables>(
      gql(queries.automationsMain),
      {
        name: 'automationsMainQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, CountQueryResponse>(gql(queries.automationsTotalCount), {
      name: 'automationsTotalCountQuery',
      options: ({ queryParams }) => ({
        variables: {
          status: queryParams.status
        }
      })
    }),
    // mutations
    graphql<{}, AddMutationResponse, IAutomationDoc>(
      gql(mutations.automationsAdd),
      {
        name: 'addAutomationMutation',
        options: () => ({
          refetchQueries: ['automations', 'automationsMain', 'automationDetail']
        })
      }
    ),
    graphql<{}, {}, IAutomationDoc>(gql(mutations.automationsSaveAsTemplate), {
      name: 'duplicateMutation',
      options: () => ({
        refetchQueries: ['automations', 'automationsMain', 'automationDetail']
      })
    }),
    graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.automationsRemove),
      {
        name: 'automationsRemove',
        options: ({ queryParams }) => ({
          refetchQueries: getRefetchQueries(queryParams)
        })
      }
    )
  )(withRouter<IRouterProps>(ListContainer))
);
