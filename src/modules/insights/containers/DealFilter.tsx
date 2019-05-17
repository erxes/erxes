import gql from 'graphql-tag';
import { queries as boardQueries } from 'modules/boards/graphql';
import {
  BoardDetailQueryResponse,
  BoardsGetLastQueryResponse,
  BoardsQueryResponse
} from 'modules/boards/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DealFilter } from '../components';
import { IQueryParams } from '../types';

type Props = {
  location: any;
  history: any;
  queryParams: IQueryParams;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  boardDetailQuery?: BoardDetailQueryResponse;
  boardGetLastQuery?: BoardsGetLastQueryResponse;
} & Props;

const DealFilterContainer = (props: FinalProps) => {
  const {
    boardsQuery,
    boardGetLastQuery,
    boardDetailQuery,
    queryParams
  } = props;

  const boardId = queryParams.boardId;

  const lastBoard = boardGetLastQuery && boardGetLastQuery.boardGetLast;
  const currentBoard = boardDetailQuery && boardDetailQuery.boardDetail;

  let pipelines;

  if (!boardId && lastBoard) {
    pipelines = lastBoard.pipelines;
  } else if (currentBoard) {
    pipelines = currentBoard.pipelines;
  }

  const extendedProps = {
    ...props,
    boards: boardsQuery.boards || [],
    pipelines: (currentBoard && currentBoard.pipelines) || []
  };

  return <DealFilter {...extendedProps} />;
};

export default compose(
  graphql<Props, BoardsQueryResponse>(gql(boardQueries.boards), {
    name: 'boardsQuery'
  }),
  graphql<Props, BoardsGetLastQueryResponse>(gql(boardQueries.boardGetLast), {
    name: 'boardGetLastQuery'
  }),
  graphql<Props, BoardDetailQueryResponse, { _id: string }>(
    gql(boardQueries.boardDetail),
    {
      name: 'boardDetailQuery',
      skip: ({ queryParams }) => !queryParams.boardId,
      options: ({ queryParams }) => ({
        variables: {
          _id: queryParams.boardId
        }
      })
    }
  )
)(DealFilterContainer);
