import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import Spinner from 'modules/common/components/Spinner';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries as integrationQueries } from '../../../integrations/graphql';
import Base from '../../components/scheduler/Base';
import { mutations, queries } from '../../graphql';
import {
  CalendarsQueryResponse,
  RemoveSchedulePageMutationResponse
} from '../../types';

type Props = {
  queryParams: { accountId?: string };
  currentUser?: IUser;
  history: any;
};

type FinalProps = {
  calendarsQuery: CalendarsQueryResponse;
  fetchApiQuery: any;
} & Props &
  RemoveSchedulePageMutationResponse;
class BaseContainer extends React.Component<FinalProps> {
  render() {
    const {
      fetchApiQuery,
      queryParams,
      history,
      calendarsQuery,
      removeMutation
    } = this.props;

    if (
      (fetchApiQuery && fetchApiQuery.loading) ||
      (calendarsQuery && calendarsQuery.loading)
    ) {
      return <Spinner objective={true} />;
    }

    if (fetchApiQuery && fetchApiQuery.error) {
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
            fetchApiQuery.refetch();

            Alert.success('You successfully deleted a page');
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    const pages = (fetchApiQuery && fetchApiQuery.integrationsFetchApi) || [];

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
    graphql<Props, any>(gql(integrationQueries.fetchApi), {
      name: 'fetchApiQuery',
      skip: props => !props.queryParams.accountId,
      options: ({ queryParams }) => {
        return {
          variables: {
            path: '/nylas/get-schedule-pages',
            params: {
              accountId: queryParams.accountId
            }
          }
        };
      }
    }),
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
