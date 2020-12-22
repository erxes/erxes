import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries as integrationQueries } from '../../../integrations/graphql';
import Base from '../../components/scheduler/Base';
import { queries } from '../../graphql';
import { CalendarsQueryResponse } from '../../types';

type Props = {
  queryParams: { accountId?: string };
  currentUser?: IUser;
  history: any;
};

type FinalProps = {
  calendarsQuery: CalendarsQueryResponse;
  fetchApiQuery: any;
} & Props;

class BaseContainer extends React.Component<FinalProps, {}> {
  render() {
    const { fetchApiQuery, queryParams, history, calendarsQuery } = this.props;

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
    console.log(fetchApiQuery);

    const pages = (fetchApiQuery && fetchApiQuery.integrationsFetchApi) || [];

    const updatedProps = {
      calendars: (calendarsQuery && calendarsQuery.calendars) || [],
      pages,
      queryParams,
      history
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
    })
  )(BaseContainer)
);

export default (props: Props) => (
  <AppConsumer>
    {({ currentUser }) => <WithProps {...props} currentUser={currentUser} />}
  </AppConsumer>
);
