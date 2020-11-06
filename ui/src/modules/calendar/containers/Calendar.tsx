import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Calendar from '../components/Calendar';
import { CalendarsQueryResponse } from 'modules/settings/calendars/types';
import { queries as CalendarQueries } from 'modules/settings/calendars/graphql';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  calendarsQuery: CalendarsQueryResponse;
} & Props;

class CalendarContainer extends React.Component<FinalProps> {
  render() {
    const { calendarsQuery } = this.props;

    if (calendarsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const calendars = calendarsQuery.calendars || [];

    const updatedProps = {
      ...this.props,
      calendars
    };

    return <Calendar {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, CalendarsQueryResponse, { groupId: string }>(
      gql(CalendarQueries.calendars),
      {
        name: 'calendarsQuery',
        options: () => ({
          variables: { groupId: 'CiDdKPLRd8q8awfwb' },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(CalendarContainer)
);
