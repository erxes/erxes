import gql from 'graphql-tag';
import { STORAGE_BOARD_KEY } from 'modules/boards/constants';
import { getBoardId } from 'modules/boards/containers/MainActionBar';
import { queries } from 'modules/boards/graphql';
import { PageHeader } from 'modules/boards/styles/header';
import {
  BoardDetailQueryResponse,
  BoardsGetLastQueryResponse,
  BoardsQueryResponse
} from 'modules/boards/types';
import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import queryString from 'query-string';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import DashBoard from '../components/Dashboard';

type Props = {
  id: string;
} & IRouterProps;

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  boardGetLastQuery?: BoardsGetLastQueryResponse;
  boardDetailQuery?: BoardDetailQueryResponse;
} & Props;

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

class DashBoardContainer extends React.Component<FinalProps> {
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

    const { defaultBoards } = getDefaultBoardAndPipelines();

    if (boardId) {
      defaultBoards.growthHack = boardId;

      localStorage.setItem(STORAGE_BOARD_KEY, JSON.stringify(defaultBoards));
    }

    // wait for load
    if (boardDetailQuery && boardDetailQuery.loading) {
      return <Spinner />;
    }

    if (boardGetLastQuery && boardGetLastQuery.loading) {
      return <Spinner />;
    }

    const lastBoard = boardGetLastQuery && boardGetLastQuery.boardGetLast;
    const currentBoard = boardDetailQuery && boardDetailQuery.boardDetail;

    // if there is no boardId in queryparams and there is one in localstorage
    // then put those in queryparams
    const defaultBoardId = defaultBoards.growthHack;

    if (!boardId && defaultBoardId) {
      routerUtils.setParams(history, {
        id: defaultBoardId
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
      routerUtils.setParams(history, { id: lastBoard._id });

      return null;
    }

    // If there is an invalid boardId localstorage then remove invalid keys
    // and reload the page
    if (!currentBoard && boardId) {
      delete defaultBoards.growthHack;

      localStorage.setItem(STORAGE_BOARD_KEY, JSON.stringify(defaultBoards));

      window.location.href = `/growthHack/dashboard`;
      return null;
    }

    const props = {
      queryParams,
      history,
      currentBoard,
      boards: boardsQuery.boards || []
    };

    return <DashBoard {...props} />;
  }
}

export default withRouter(
  withProps<Props>(
    compose(
      graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
        name: 'boardsQuery',
        options: () => ({
          variables: { type: 'growthHack' }
        })
      }),
      graphql<Props, BoardsGetLastQueryResponse>(gql(queries.boardGetLast), {
        name: 'boardGetLastQuery',
        skip: getBoardId,
        options: () => ({
          variables: { type: 'growthHack' }
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
    )(DashBoardContainer)
  )
);
