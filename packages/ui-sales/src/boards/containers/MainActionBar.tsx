import * as compose from "lodash.flowright";

import {
  BoardDetailQueryResponse,
  BoardsGetLastQueryResponse,
  BoardsQueryResponse
} from "../types";
import { STORAGE_BOARD_KEY, STORAGE_PIPELINE_KEY } from "../constants";
import { router as routerUtils, withProps } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { PageHeader } from "../styles/header";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import _ from "lodash";
import { getDefaultBoardAndPipelines } from "../utils";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "../graphql";
import queryString from "query-string";

type Props = {
  type: string;
  component: any;
  middleContent?: () => React.ReactNode;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  boardGetLastQuery?: BoardsGetLastQueryResponse;
  boardDetailQuery?: BoardDetailQueryResponse;
} & Props;

const FILTER_PARAMS = [
  "search",
  "userIds",
  "branchIds",
  "departmentIds",
  "priority",
  "assignedUserIds",
  "labelIds",
  "productIds",
  "companyIds",
  "customerIds",
  "segment",
  "assignedToMe",
  "closeDateType",
  "startDate",
  "endDate",
  "createdStartDate",
  "createdEndDate",
  "stateChangedStartDate",
  "stateChangedEndDate",
  "startDateStartDate",
  "startDateEndDate",
  "closeDateStartDate",
  "closeDateEndDate"
];

export const getBoardId = () => {
  const queryParams = queryString.parse(location.search);
  return queryParams.id;
};

const defaultParams = ["id", "pipelineId"];

/*
 * Main board component
 */
function Main(props: FinalProps) {
  const {
    boardsQuery,
    boardGetLastQuery,
    boardDetailQuery,
    type,
    middleContent
  } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const onSearch = (search: string) => {
    if (!search) {
      return routerUtils.removeParams(navigate, location, "search");
    }

    routerUtils.setParams(navigate, location, { search });
  };

  const onSelect = (values: string[] | string, key: string) => {
    if (queryParams[key] === values) {
      return routerUtils.removeParams(navigate, location, key);
    }

    return routerUtils.setParams(navigate, location, { [key]: values });
  };

  const isFiltered = (): boolean => {
    for (const param in queryParams) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    const remainedParams = Object.keys(queryParams).filter(
      key => !defaultParams.includes(key)
    );

    routerUtils.removeParams(navigate, location, ...remainedParams);
  };

  if (boardsQuery.loading) {
    return <PageHeader />;
  }

  const boardId = getBoardId();
  const { pipelineId } = queryParams;

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  if (boardId && pipelineId) {
    defaultBoards[type] = boardId;
    defaultPipelines[type] = pipelineId;

    localStorage.setItem(STORAGE_BOARD_KEY, JSON.stringify(defaultBoards));
    localStorage.setItem(
      STORAGE_PIPELINE_KEY,
      JSON.stringify(defaultPipelines)
    );
  }

  // wait for load
  if (boardDetailQuery && boardDetailQuery.loading) {
    return <Spinner />;
  }

  if (boardGetLastQuery && boardGetLastQuery.loading) {
    return <Spinner />;
  }

  const lastBoard = boardGetLastQuery && boardGetLastQuery.salesBoardGetLast;
  const currentBoard = boardDetailQuery && boardDetailQuery.salesBoardDetail;

  // if there is no boardId in queryparams and there is one in localstorage
  // then put those in queryparams
  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards[type],
    defaultPipelines[type]
  ];
  const hasBoardId = queryParams._id || false;

  if (!boardId && defaultBoardId && !hasBoardId) {
    routerUtils.setParams(navigate, location, {
      id: defaultBoardId,
      pipelineId: defaultPipelineId
    });

    return null;
  }

  // if there is no boardId in queryparams and there is lastBoard
  // then put lastBoard._id and this board's first pipelineId to queryparams
  if (
    !boardId &&
    lastBoard &&
    lastBoard.pipelines &&
    lastBoard.pipelines.length > 0
  ) {
    const [firstPipeline] = lastBoard.pipelines;

    routerUtils.setParams(navigate, location, {
      id: lastBoard._id,
      pipelineId: firstPipeline._id
    });

    return null;
  }

  // If there is an invalid boardId localstorage then remove invalid keys
  // and reload the page
  if (!currentBoard && boardId) {
    delete defaultBoards[type];
    delete defaultPipelines[type];

    localStorage.setItem(STORAGE_BOARD_KEY, JSON.stringify(defaultBoards));
    localStorage.setItem(
      STORAGE_PIPELINE_KEY,
      JSON.stringify(defaultPipelines)
    );

    navigate(`/${type}/board`);
    return null;
  }

  const pipelines = currentBoard ? currentBoard.pipelines || [] : [];

  const currentPipeline = pipelineId
    ? pipelines.find(pipe => pipe._id === pipelineId)
    : pipelines[0];

  const updatedProps = {
    middleContent,
    onSearch,
    queryParams,
    history,
    currentBoard,
    currentPipeline,
    boards: boardsQuery.salesBoards || []
  };

  const extendedProps = {
    ...updatedProps,
    type,
    onSelect,
    isFiltered,
    clearFilter
  };

  const Component = props.component;

  return <Component {...extendedProps} />;
}

const MainActionBarContainer = withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
      name: "boardsQuery",
      options: ({ type }) => ({
        variables: { type }
      })
    }),
    graphql<Props, BoardsGetLastQueryResponse>(gql(queries.boardGetLast), {
      name: "boardGetLastQuery",
      skip: getBoardId,
      options: ({ type }) => ({
        variables: { type }
      })
    }),
    graphql<Props, BoardDetailQueryResponse, { _id: string }>(
      gql(queries.boardDetail),
      {
        name: "boardDetailQuery",
        skip: () => !getBoardId(),
        options: () => ({
          variables: { _id: getBoardId() }
        })
      }
    )
  )(Main)
);

export default MainActionBarContainer;
