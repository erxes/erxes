import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import { IPipeline } from 'modules/settings/deals/types';
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

    const queryParams = generateQueryParams({ location });

    const lastBoard = boardGetLastQuery && boardGetLastQuery.dealBoardGetLast;
    const currentBoard = boardDetailQuery && boardDetailQuery.dealBoardDetail;

    let currentPipeline: IPipeline | undefined;
    let boardId = queryParams.id || localStorage.getItem(STORAGE_BOARD_KEY);
    let pipelineId =
      queryParams.pipelineId || localStorage.getItem(STORAGE_PIPELINE_KEY);

    if (!boardId && lastBoard) {
      boardId = lastBoard._id;

      if (lastBoard.pipelines && lastBoard.pipelines.length > 0) {
        pipelineId = lastBoard.pipelines[0]._id;
      }

      routerUtils.setParams(history, { id: boardId, pipelineId });

      return null;
    }

    if (currentBoard) {
      currentPipeline = (currentBoard.pipelines || []).find(
        pipe => pipe._id === pipelineId
      );

      localStorage.setItem(STORAGE_BOARD_KEY, boardId);
      localStorage.setItem(STORAGE_PIPELINE_KEY, pipelineId);
    }

    if (boardsQuery.loading) {
      return <PageHeader />;
    }

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

const generateQueryParams = ({ location }: { location: any }) => {
  return queryString.parse(location.search);
};

const MainActionBar = withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
      name: 'boardsQuery'
    }),
    graphql<Props, BoardsGetLastQueryResponse>(gql(queries.boardGetLast), {
      name: 'boardGetLastQuery'
    }),
    graphql<Props, BoardDetailQueryResponse, { _id: string }>(
      gql(queries.boardDetail),
      {
        name: 'boardDetailQuery',
        skip: props => {
          const queryParams = generateQueryParams(props);
          return !queryParams.id && !localStorage.getItem(STORAGE_BOARD_KEY);
        },
        options: props => {
          const queryParams = generateQueryParams(props);
          return {
            variables: {
              _id: queryParams.id || localStorage.getItem(STORAGE_BOARD_KEY)
            }
          };
        }
      }
    )
  )(Main)
);

export default withRouter(MainActionBar);
