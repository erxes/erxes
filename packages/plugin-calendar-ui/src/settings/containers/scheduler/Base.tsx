import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  CalendarsQueryResponse,
  RemoveSchedulePageMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import { AppConsumer } from '@erxes/ui/src/appContext';
import Base from '../../components/scheduler/Base';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries as integrationQueries } from '@erxes/ui-inbox/src/settings/integrations/graphql';

type Props = {
  queryParams: { accountId?: string };
  currentUser?: IUser;
  history: any;
};

type FinalProps = {
  calendarsQuery: CalendarsQueryResponse;
  fetchPagesQuery: any;
} & Props &
  RemoveSchedulePageMutationResponse;
class BaseContainer extends React.Component<FinalProps> {
  render() {
    const {
      fetchPagesQuery,
      queryParams,
      history,
      calendarsQuery,
      removeMutation
    } = this.props;

    if (
      (fetchPagesQuery && fetchPagesQuery.loading) ||
      (calendarsQuery && calendarsQuery.loading)
    ) {
      return <Spinner objective={true} />;
    }

    if (fetchPagesQuery && fetchPagesQuery.error) {
      return (
        <span style={{ color: 'red' }}>Integrations api is not running</span>
      );
    }

    const remove = (_id: string) => {
      confirm().then(() => {
        removeMutation({
          variables: { pageId: _id }
        })
          .then(() => {
            fetchPagesQuery.refetch();

            Alert.success('You successfully deleted a page');
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    const pages =
      (fetchPagesQuery && fetchPagesQuery.integrationsNylasGetSchedulePages) ||
      [];

    const updatedProps = {
      calendars: (calendarsQuery && calendarsQuery.calendars) || [],
      pages,
      queryParams,
      history,
      remove
    };

    return <Base {...updatedProps} />;
  }
}

const WithProps = withProps<Props>(
  compose(
    graphql<Props, any>(
      gql(integrationQueries.integrationsNylasGetSchedulePages),
      {
        name: 'fetchPagesQuery',
        skip: props => !props.queryParams.accountId,
        options: ({ queryParams }) => {
          return {
            variables: {
              accountId: queryParams.accountId
            }
          };
        }
      }
    ),
    graphql<Props, CalendarsQueryResponse>(gql(queries.calendars), {
      name: 'calendarsQuery',
      skip: props => !props.currentUser,
      options: ({ currentUser }) => ({
        variables: { userId: currentUser && currentUser._id },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, RemoveSchedulePageMutationResponse, { pageId: string }>(
      gql(mutations.deleteSchedulePage),
      {
        name: 'removeMutation'
      }
    )
  )(BaseContainer)
);

export default (props: Props) => (
  <AppConsumer>
    {({ currentUser }) => <WithProps {...props} currentUser={currentUser} />}
  </AppConsumer>
);
