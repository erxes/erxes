import * as compose from 'lodash.flowright';
import { ColumnProps } from 'modules/boards/components/Calendar';
import { calendarColumnQuery, onCalendarLoadMore } from 'modules/boards/utils';
import { withProps } from 'modules/common/utils';
import { getMonthTitle } from 'modules/common/utils/calendar';
import CalendarColumn from 'modules/tickets/components/CalendarColumn';
import React from 'react';
import { queries } from '../graphql';
import { TicketsQueryResponse, TicketsTotalCountQueryResponse } from '../types';

type FinalProps = ColumnProps & {
  ticketsQuery: TicketsQueryResponse;
  ticketsTotalCountQuery: TicketsTotalCountQueryResponse;
};

class TicketColumnContainer extends React.Component<FinalProps> {
  componentWillReceiveProps(nextProps: FinalProps) {
    const { updatedAt, ticketsQuery, ticketsTotalCountQuery } = this.props;

    if (updatedAt !== nextProps.updatedAt) {
      ticketsQuery.refetch();
      ticketsTotalCountQuery.refetch();
    }
  }

  render() {
    const {
      ticketsQuery,
      ticketsTotalCountQuery,
      date: { month }
    } = this.props;

    const { fetchMore } = ticketsQuery;

    // Update calendar after stage updated
    if (localStorage.getItem('cacheInvalidated') === 'true') {
      localStorage.setItem('cacheInvalidated', 'false');

      ticketsQuery.refetch();
      ticketsTotalCountQuery.refetch();
    }

    const title = getMonthTitle(month);
    const tickets = ticketsQuery.tickets || [];
    const totalCount = ticketsTotalCountQuery.ticketsTotalCount || 0;

    const onLoadMore = (skip: number) => {
      return onCalendarLoadMore(fetchMore, 'tickets', skip);
    };

    const updatedProps = {
      ...this.props,
      tickets,
      totalCount,
      title,
      onLoadMore
    };

    return <CalendarColumn {...updatedProps} />;
  }
}

export default withProps<ColumnProps>(
  compose(
    calendarColumnQuery(queries.tickets, 'ticketsQuery'),
    calendarColumnQuery(queries.ticketsTotalCount, 'ticketsTotalCountQuery')
  )(TicketColumnContainer)
);
