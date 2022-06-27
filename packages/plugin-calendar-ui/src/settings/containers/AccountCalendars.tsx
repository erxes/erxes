import * as compose from 'lodash.flowright';

import { Alert, __, withProps } from 'coreui/utils';
import {
  EditAccountCalendarMutationResponse,
  EditAccountCalendarMutationVariables
} from '../types';

import CalendarAccounts from '../components/AccountCalendars';
import Info from '@erxes/ui/src/components/Info';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { queries as calendarQueries } from '../../calendar/graphql';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { mutations } from '../graphql';
import { queries } from '@erxes/ui-inbox/src/settings/integrations/graphql';

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
