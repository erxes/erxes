import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { PageHeader } from 'modules/boards/styles/header';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import { queries } from 'modules/settings/calendars/graphql';
import {
  GroupDetailQueryResponse,
  GroupGetLastQueryResponse,
  GroupsQueryResponse
} from 'modules/settings/calendars/types';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Calendar from '../components/Calendar';
import { STORAGE_CALENDAR_GROUP_KEY, STORAGE_CALENDAR_KEY } from '../constants';

type Props = {
  history: any;
  queryParams: any;
} & IRouterProps;

type FinalProps = {
  groupsQuery: GroupsQueryResponse;
  groupGetLastQuery?: GroupGetLastQueryResponse;
  groupDetailQuery?: GroupDetailQueryResponse;
} & Props;

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

export const getGroupId = ({ location }) => {
  const queryParams = generateQueryParams({ location });
  return queryParams.id;
};

/*
 * Main group component
 */
class Main extends React.Component<FinalProps> {
  render() {
    const {
      history,
      location,
      groupsQuery,
      groupGetLastQuery,
      groupDetailQuery
    } = this.props;

    if (groupsQuery.loading) {
      return <PageHeader />;
    }

    const queryParams = generateQueryParams({ location });
    const groupId = getGroupId({ location });
    const { calendarId } = queryParams;

    if (groupId && calendarId) {
      localStorage.setItem(STORAGE_CALENDAR_GROUP_KEY, groupId);
      localStorage.setItem(STORAGE_CALENDAR_KEY, calendarId);
    }

    // wait for load
    if (groupDetailQuery && groupDetailQuery.loading) {
      return <Spinner />;
    }

    if (groupGetLastQuery && groupGetLastQuery.loading) {
      return <Spinner />;
    }

    const lastGroup =
      groupGetLastQuery && groupGetLastQuery.calendarGroupGetLast;
    const currentGroup =
      groupDetailQuery && groupDetailQuery.calendarGroupDetail;

    // if there is no groupId in queryparams and there is one in localstorage
    // then put those in queryparams
    const defaultGroupId = localStorage.getItem(STORAGE_CALENDAR_GROUP_KEY);
    const defaultCalendarId = localStorage.getItem(STORAGE_CALENDAR_KEY);

    if (!groupId && defaultGroupId) {
      routerUtils.setParams(history, {
        id: defaultGroupId,
        calendarId: defaultCalendarId
      });

      return null;
    }

    // if there is no groupId in queryparams and there is lastGroup
    // then put lastGroup._id and this group's first calendarId to queryparams
    if (
      !groupId &&
      lastGroup &&
      lastGroup.calendars &&
      lastGroup.calendars.length > 0
    ) {
      const [firstCalendar] = lastGroup.calendars;

      routerUtils.setParams(history, {
        id: lastGroup._id,
        calendarId: firstCalendar._id
      });

      return null;
    }

    const calendars = currentGroup ? currentGroup.calendars || [] : [];

    const currentCalendar = calendarId
      ? calendars.find(calendar => calendar._id === calendarId) || calendars[0]
      : calendars[0];

    const props = {
      queryParams,
      history,
      currentGroup,
      currentCalendar,
      groups: groupsQuery.calendarGroups || []
    };

    const extendedProps = {
      ...props
    };

    return <Calendar {...extendedProps} />;
  }
}

const MainActionBarContainer = withProps<Props>(
  compose(
    graphql<Props, GroupsQueryResponse>(gql(queries.groups), {
      name: 'groupsQuery',
      options: () => ({
        variables: {}
      })
    }),
    graphql<Props, GroupGetLastQueryResponse>(gql(queries.groupGetLast), {
      name: 'groupGetLastQuery',
      skip: props => getGroupId(props),
      options: () => ({
        variables: {}
      })
    }),
    graphql<Props, GroupDetailQueryResponse, { _id: string }>(
      gql(queries.groupDetail),
      {
        name: 'groupDetailQuery',
        skip: props => !getGroupId(props),
        options: props => ({
          variables: { _id: getGroupId(props) }
        })
      }
    )
  )(Main)
);

export default withRouter(MainActionBarContainer);
