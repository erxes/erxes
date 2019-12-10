import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { STORAGE_BOARD_KEY } from 'modules/boards/constants';
import { getBoardId } from 'modules/boards/containers/MainActionBar';
import { queries } from 'modules/boards/graphql';
import { PageHeader } from 'modules/boards/styles/header';
import {
  BoardsGetLastQueryResponse,
  BoardsQueryResponse
} from 'modules/boards/types';
import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import Home from '../../components/home/Home';

type Props = {
  id: string;
  state: string;
} & IRouterProps;

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  boardGetLastQuery?: BoardsGetLastQueryResponse;
} & Props;

class HomeContainer extends React.Component<FinalProps> {
  render() {
    const {
      history,
      location,
      boardsQuery,
      boardGetLastQuery,
      state
    } = this.props;

    if (boardsQuery.loading) {
      return <PageHeader />;
    }

    const boardId = getBoardId({ location });

    const { defaultBoards } = getDefaultBoardAndPipelines();

    if (boardId) {
      defaultBoards.growthHack = boardId;

      localStorage.setItem(STORAGE_BOARD_KEY, JSON.stringify(defaultBoards));
    }

    if (boardGetLastQuery && boardGetLastQuery.loading) {
      return <Spinner />;
    }

    const lastBoard = boardGetLastQuery && boardGetLastQuery.boardGetLast;

    // if there is no boardId in queryparams and there is one in localstorage
    // then put those in queryparams
    const defaultBoardId = defaultBoards.growthHack;

    if (!boardId && defaultBoardId) {
      routerUtils.setParams(
        history,
        {
          id: defaultBoardId
        },
        true
      );

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

    const props = {
      state,
      boardId,
      boards: boardsQuery.boards || []
    };

    return <Home {...props} />;
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
      })
    )(HomeContainer)
  )
);
