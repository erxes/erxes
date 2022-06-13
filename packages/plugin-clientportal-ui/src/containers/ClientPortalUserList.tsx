import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Bulk from '@erxes/ui/src/components/Bulk';
import { IRouterProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../graphql';
import ClientPortalUserList from '../components/list/ClientPortalUserList';
import {
  ListQueryVariables,
  MainQueryResponse,
  RemoveMutationResponse
} from '../types';

type Props = {
  queryParams: any;
  showImportBar: () => void;
  type?: string;
};

type FinalProps = {
  clientPortalUsersMainQuery: MainQueryResponse;
} & Props &
  RemoveMutationResponse &
  IRouterProps;

type State = {
  loading: boolean;
  responseId: string;
};

class ClientportalUserListContainer extends React.Component<FinalProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      responseId: ''
    };
  }

  refetchWithDelay = () => {
    this.timer = setTimeout(() => {
      this.props.clientPortalUsersMainQuery.refetch();
    }, 5500);
  };

  render() {
    const {
      clientPortalUsersMainQuery,
      clientPortalUsersRemove,
      type,
      history
    } = this.props;

    const removeCustomers = ({ clientPortalUserIds }, emptyBulk) => {
      clientPortalUsersRemove({
        variables: { clientPortalUserIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success(
            'You successfully deleted a user. The changes will take a few seconds',
            4500
          );

          this.refetchWithDelay();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      // clientPortalUsers: list,
      // totalCount,
      // searchValue,
      // loading: clientPortalUsersMainQuery.loading || this.state.loading,
      responseId: this.state.responseId,
      removeCustomers,
      refetch: this.refetchWithDelay
    };

    const content = props => {
      return <ClientPortalUserList {...updatedProps} {...props} />;
    };

    return (
      <Bulk
        content={content}
        // refetch={this.props.clientPortalUsersMainQuery.refetch}
      />
    );
  }
}

const generateParams = ({ queryParams, type }) => {
  return {
    ...generatePaginationParams(queryParams),
    segment: queryParams.segment,
    tag: queryParams.tag,
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    brand: queryParams.brand,
    integration: queryParams.integrationType,
    form: queryParams.form,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    leadStatus: queryParams.leadStatus,
    sortField: queryParams.sortField,
    type,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  };
};

const getRefetchQueries = (queryParams?: any, type?: string) => {
  return [
    {
      query: gql(queries.clientPortalUsersMain),
      variables: { ...generateParams({ queryParams, type }) }
    }
  ];
};

export default ClientportalUserListContainer;
