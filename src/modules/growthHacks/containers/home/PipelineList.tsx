import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { STORAGE_BOARD_KEY } from 'modules/boards/constants';
import { getBoardId } from 'modules/boards/containers/MainActionBar';
import { queries } from 'modules/boards/graphql';
import { BoardDetailQueryResponse } from 'modules/boards/types';
import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import PipelineList from '../../components/home/PipelineList';

type Props = {
  state: string;
} & IRouterProps;

type FinalProps = {
  boardDetailQuery?: BoardDetailQueryResponse;
} & Props;

class PipelineListContainer extends React.Component<FinalProps> {
  render() {
    const { history, location, state, boardDetailQuery } = this.props;

    const boardId = getBoardId({ location });

    const { defaultBoards } = getDefaultBoardAndPipelines();

    // wait for load
    if (boardDetailQuery && boardDetailQuery.loading) {
      return <Spinner />;
    }

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

    // If there is an invalid boardId localstorage then remove invalid keys
    // and reload the page
    if (!currentBoard && boardId) {
      delete defaultBoards.growthHack;

      localStorage.setItem(STORAGE_BOARD_KEY, JSON.stringify(defaultBoards));

      window.location.href = `/growthHack/home`;
      return null;
    }

    let pipelines = currentBoard ? currentBoard.pipelines || [] : [];

    if (state) {
      pipelines = pipelines.filter(pipeline => pipeline.state === state);
    }

    const props = {
      currentBoard,
      pipelines
    };

    return <PipelineList {...props} />;
  }
}

export default withRouter(
  withProps<Props>(
    compose(
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
    )(PipelineListContainer)
  )
);
