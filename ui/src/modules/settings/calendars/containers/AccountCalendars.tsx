import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries as calendarQueries } from 'modules/calendar/graphql';
import Info from 'modules/common/components/Info';
import Spinner from 'modules/common/components/Spinner';
import { __, Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../../integrations/graphql';
import CalendarAccounts from '../components/AccountCalendars';
import { mutations } from '../graphql';
import {
  EditAccountCalendarMutationResponse,
  EditAccountCalendarMutationVariables
} from '../types';

type Props = {
  accountId: string;
  groupId: string;
};

type FinalProps = {
  fetchApiQuery: any;
} & Props &
  EditAccountCalendarMutationResponse;

class EventContainer extends React.Component<FinalProps, {}> {
  render() {
    const { fetchApiQuery, editMutation, groupId } = this.props;

    if (fetchApiQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (fetchApiQuery.error) {
      return <Info bordered={false}>{fetchApiQuery.error.message}</Info>;
    }

    // edit action
    const editCalendar = (doc: EditAccountCalendarMutationVariables) => {
      editMutation({
        variables: doc,
        refetchQueries: getRefetchQueries(groupId)
      })
        .then(() => {
          fetchApiQuery.refetch();

          const msg = `${__(`You successfully edited a`)} ${__('calendar')}.`;

          Alert.success(msg);
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      calendars: fetchApiQuery.integrationsFetchApi || [],
      editCalendar
    };

    return <CalendarAccounts {...updatedProps} />;
  }
}

const getRefetchQueries = (groupId: string) => {
  return [
    {
      query: gql(calendarQueries.calendars),
      variables: { groupId }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.fetchApi), {
      name: 'fetchApiQuery',
      options: ({ accountId }) => {
        return {
          variables: {
            path: '/nylas/get-calendars',
            params: {
              accountId
            }
          }
        };
      }
    }),
    graphql<
      Props,
      EditAccountCalendarMutationResponse,
      EditAccountCalendarMutationVariables
    >(gql(mutations.editAccountCalendar), {
      name: 'editMutation'
    })
  )(EventContainer)
);
