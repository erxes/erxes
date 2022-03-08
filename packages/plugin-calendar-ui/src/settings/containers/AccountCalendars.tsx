import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries as calendarQueries } from '../../calendar/graphql';
import Info from '@erxes/ui/src/components/Info';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __, Alert, withProps } from 'coreui/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '@erxes/ui-settings/src/integrations/graphql';
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
  fetchCalendarQuery: any;
} & Props &
  EditAccountCalendarMutationResponse;

class EventContainer extends React.Component<FinalProps, {}> {
  render() {
    const { fetchCalendarQuery, editMutation, groupId } = this.props;

    if (fetchCalendarQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (fetchCalendarQuery.error) {
      return <Info>{fetchCalendarQuery.error.message}</Info>;
    }

    // edit action
    const editCalendar = (doc: EditAccountCalendarMutationVariables) => {
      editMutation({
        variables: doc,
        refetchQueries: getRefetchQueries(groupId)
      })
        .then(() => {
          fetchCalendarQuery.refetch();

          const msg = `${__(`You successfully edited a`)} ${__('calendar')}.`;

          Alert.success(msg);
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      calendars: fetchCalendarQuery.integrationsNylasGetCalendars || [],
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
    graphql<Props, any>(gql(queries.integrationsNylasGetCalendars), {
      name: 'fetchCalendarQuery',
      options: ({ accountId }) => {
        return {
          variables: {
            accountId
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
