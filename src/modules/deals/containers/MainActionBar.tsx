import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import queryString from 'query-string';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { MainActionBar as DumbMainActionBar } from '../components';
import { STORAGE_BOARD_KEY, STORAGE_PIPELINE_KEY } from '../constants';
import { queries } from '../graphql';
import { PageHeader } from '../styles/header';
import {
  BoardDetailQueryResponse,
  BoardsGetLastQueryResponse,
  BoardsQueryResponse
} from '../types';

type Props = {
  middleContent?: () => React.ReactNode;
} & IRouterProps;

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  boardGetLastQuery?: BoardsGetLastQueryResponse;
  boardDetailQuery?: BoardDetailQueryResponse;
} & Props;

const getBoardId = ({ location }) => {
  const queryParams = generateQueryParams({ location });
  return queryParams.id;
};

/*
 * Main board component
 */
class Main extends React.Component<FinalProps> {
  onSearch = (search: string) => {
    routerUtils.setParams(this.props.history, { search });
  };

  render() {
    const {
      history,
      location,
      boardsQuery,
      boardGetLastQuery,
      boardDetailQuery,
      middleContent
    } = this.props;

    if (boardsQuery.loading) {
      return <PageHeader />;
    }

    const queryParams = generateQueryParams({ location });
    const boardId = getBoardId({ location });
    const { pipelineId } = queryParams;

    if (boardId && pipelineId) {
      localStorage.setItem(STORAGE_BOARD_KEY, boardId);
      localStorage.setItem(STORAGE_PIPELINE_KEY, pipelineId);
    }

    // wait for load
    if (boardDetailQuery && boardDetailQuery.loading) {
      return <Spinner />;
    }

    if (boardGetLastQuery && boardGetLastQuery.loading) {
      return <Spinner />;
    }

    const lastBoard = boardGetLastQuery && boardGetLastQuery.dealBoardGetLast;
    const currentBoard = boardDetailQuery && boardDetailQuery.dealBoardDetail;

    // if there is no boardId in queryparams and there is one in localstorage
    // then put those in queryparams
    if (!boardId && localStorage.getItem(STORAGE_BOARD_KEY)) {
      routerUtils.setParams(history, {
        id: localStorage.getItem(STORAGE_BOARD_KEY),
        pipelineId: localStorage.getItem(STORAGE_PIPELINE_KEY)
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

      routerUtils.setParams(history, {
        id: lastBoard._id,
        pipelineId: firstPipeline._id
      });

      return null;
    }

    // If there is an invalid boardId localstorage then remove invalid keys
    // and reload the page
    if (!currentBoard && boardId) {
      localStorage.setItem(STORAGE_BOARD_KEY, '');
      localStorage.setItem(STORAGE_PIPELINE_KEY, '');
      window.location.href = '/deal/board';
      return null;
    }

    if (!currentBoard) {
      return null;
    }

    const pipelines = currentBoard.pipelines || [];
    const currentPipeline = pipelineId
      ? pipelines.find(pipe => pipe._id === pipelineId)
      : pipelines[0];

    return (
      <DumbMainActionBar
        middleContent={middleContent}
        onSearch={this.onSearch}
        queryParams={queryParams}
        history={history}
        currentBoard={currentBoard}
        currentPipeline={currentPipeline}
        boards={boardsQuery.dealBoards || []}
      />
    );
  }
}

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

const MainActionBar = withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
      name: 'boardsQuery'
    }),
    graphql<Props, BoardsGetLastQueryResponse>(gql(queries.boardGetLast), {
      name: 'boardGetLastQuery',
      skip: getBoardId
    }),
    graphql<Props, BoardDetailQueryResponse, { _id: string }>(
      gql(queries.boardDetail),
      {
        name: 'boardDetailQuery',
        skip: props => !getBoardId(props),
        options: props => {
          return {
            variables: {
              _id: getBoardId(props)
            }
          };
        }
      }
    )
  )(Main)
);

export default withRouter(MainActionBar);
