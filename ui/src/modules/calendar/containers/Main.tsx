import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { PageHeader } from 'modules/boards/styles/header';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import { queries } from 'modules/settings/calendars/graphql';
import {
  BoardDetailQueryResponse,
  BoardGetLastQueryResponse,
  BoardsQueryResponse
} from 'modules/settings/calendars/types';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Calendar from '../components/Main';
import { STORAGE_CALENDAR_GROUP_KEY, STORAGE_CALENDAR_KEY } from '../constants';

type Props = {
  history: any;
  queryParams: any;
} & IRouterProps;

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  boardGetLastQuery?: BoardGetLastQueryResponse;
  boardDetailQuery?: BoardDetailQueryResponse;
} & Props;

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

export const getBoardId = ({ location }) => {
  const queryParams = generateQueryParams({ location });
  return queryParams.id;
};

/*
 * Main board component
 */
class Main extends React.Component<FinalProps> {
  render() {
    const {
      history,
      location,
      boardsQuery,
      boardGetLastQuery,
      boardDetailQuery
    } = this.props;

    if (boardsQuery.loading) {
      return <PageHeader />;
    }

    const queryParams = generateQueryParams({ location });
    const boardId = getBoardId({ location });
    const { groupId } = queryParams;

    if (boardId && groupId) {
      localStorage.setItem(STORAGE_CALENDAR_GROUP_KEY, boardId);
      localStorage.setItem(STORAGE_CALENDAR_KEY, groupId);
    }

    // wait for load
    if (boardDetailQuery && boardDetailQuery.loading) {
      return <Spinner />;
    }

    if (boardGetLastQuery && boardGetLastQuery.loading) {
      return <Spinner />;
    }

    const lastBoard =
      boardGetLastQuery && boardGetLastQuery.calendarBoardGetLast;
    const currentBoard =
      boardDetailQuery && boardDetailQuery.calendarBoardDetail;

    // if there is no boardId in queryparams and there is one in localstorage
    // then put those in queryparams
    const defaultBoardId = localStorage.getItem(STORAGE_CALENDAR_GROUP_KEY);
    const defaultGroupId = localStorage.getItem(STORAGE_CALENDAR_KEY);

    if (!boardId && defaultBoardId) {
      routerUtils.setParams(history, {
        id: defaultBoardId,
        groupId: defaultGroupId
      });

      return null;
    }

    // if there is no boardId in queryparams and there is lastBoard
    // then put lastBoard._id and this board's first groupId to queryparams
    if (
      !boardId &&
      lastBoard &&
      lastBoard.groups &&
      lastBoard.groups.length > 0
    ) {
      const [firstGroup] = lastBoard.groups;

      routerUtils.setParams(history, {
        id: lastBoard._id,
        groupId: firstGroup._id
      });

      return null;
    }

    const groups = currentBoard ? currentBoard.groups || [] : [];

    const currentGroup = groupId
      ? groups.find(group => group._id === groupId) || groups[0]
      : groups[0];

    const props = {
      queryParams,
      history,
      currentBoard,
      currentGroup,
      boards: boardsQuery.calendarBoards || []
    };

    const extendedProps = {
      ...props
    };

    return <Calendar {...extendedProps} />;
  }
}

const MainActionBarContainer = withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
      name: 'boardsQuery',
      options: () => ({
        variables: {}
      })
    }),
    graphql<Props, BoardGetLastQueryResponse>(gql(queries.boardGetLast), {
      name: 'boardGetLastQuery',
      skip: props => getBoardId(props),
      options: () => ({
        variables: {}
      })
    }),
    graphql<Props, BoardDetailQueryResponse, { _id: string }>(
      gql(queries.boardDetail),
      {
        name: 'boardDetailQuery',
        skip: props => !getBoardId(props),
        options: props => ({
          variables: { _id: getBoardId(props) }
        })
      }
    )
  )(Main)
);

export default withRouter(MainActionBarContainer);
