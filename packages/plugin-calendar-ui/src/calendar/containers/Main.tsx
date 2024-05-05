import * as compose from "lodash.flowright";

import {
  BoardDetailQueryResponse,
  BoardGetLastQueryResponse,
  BoardsQueryResponse,
} from "../types";
import {
  STORAGE_CALENDAR_BOARD_KEY,
  STORAGE_CALENDAR_GROUP_KEY,
} from "../constants";
import { router as routerUtils, withProps } from "@erxes/ui/src/utils";

import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import Wrapper from "./Wrapper";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "../graphql";
import queryString from "query-string";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  boardGetLastQuery?: BoardGetLastQueryResponse;
  boardDetailQuery?: BoardDetailQueryResponse;
} & Props;

const generateQueryParams = () => {
  const location = useLocation();
  return queryString.parse(location.search);
};

export const getBoardId = () => {
  const queryParams = generateQueryParams();
  return queryParams.id;
};

/*
 * Main board component
 */
const Main = (props: FinalProps) => {
  const { boardsQuery, boardGetLastQuery, boardDetailQuery } = props;
  const location = useLocation();
  const navigate = useNavigate();

  if (boardsQuery.loading) {
    return <Spinner />;
  }

  const queryParams = generateQueryParams();
  const boardId = getBoardId();
  const { groupId } = queryParams;

  if (boardId && groupId) {
    localStorage.setItem(STORAGE_CALENDAR_BOARD_KEY, boardId);
    localStorage.setItem(STORAGE_CALENDAR_GROUP_KEY, groupId);
  }

  // wait for load
  if (boardDetailQuery && boardDetailQuery.loading) {
    return <Spinner />;
  }

  if (boardGetLastQuery && boardGetLastQuery.loading) {
    return <Spinner />;
  }

  const lastBoard = boardGetLastQuery && boardGetLastQuery.calendarBoardGetLast;
  const currentBoard = boardDetailQuery && boardDetailQuery.calendarBoardDetail;

  // if there is no boardId in queryparams and there is one in localstorage
  // then put those in queryparams
  const defaultBoardId = localStorage.getItem(STORAGE_CALENDAR_BOARD_KEY);
  const defaultGroupId = localStorage.getItem(STORAGE_CALENDAR_GROUP_KEY);

  if (!boardId && defaultBoardId) {
    routerUtils.setParams(navigate, location, {
      id: defaultBoardId,
      groupId: defaultGroupId,
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

    routerUtils.setParams(navigate, location, {
      id: lastBoard._id,
      groupId: firstGroup._id,
    });

    return null;
  }

  // If there is an invalid boardId localstorage then remove invalid keys
  // and reload the page
  if (!currentBoard && boardId) {
    localStorage.removeItem(STORAGE_CALENDAR_BOARD_KEY);
    localStorage.removeItem(STORAGE_CALENDAR_GROUP_KEY);

    window.location.href = `/calendar`;
    return null;
  }

  const groups = currentBoard ? currentBoard.groups || [] : [];

  const currentGroup = groupId
    ? groups.find((group) => group._id === groupId) || groups[0]
    : groups[0];

  const updatedProps = {
    queryParams,
    currentBoard,
    currentGroup,
    boards: boardsQuery.calendarBoards || [],
  };

  return <Wrapper {...updatedProps} />;
};

const MainActionBarContainer = withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
      name: "boardsQuery",
      options: () => ({
        variables: {},
      }),
    }),
    graphql<Props, BoardGetLastQueryResponse>(gql(queries.boardGetLast), {
      name: "boardGetLastQuery",
      skip: (props) => getBoardId(),
      options: () => ({
        variables: {},
      }),
    }),
    graphql<Props, BoardDetailQueryResponse, { _id: string }>(
      gql(queries.boardDetail),
      {
        name: "boardDetailQuery",
        skip: (props) => !getBoardId(),
        options: (props) => ({
          variables: { _id: getBoardId() },
        }),
      }
    )
  )(Main)
);

export default MainActionBarContainer;
