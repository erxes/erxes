import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { PageHeader } from '../styles/header';
import { getDefaultBoardAndPipelines } from '../utils';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import { router as routerUtils, withProps } from '@erxes/ui/src/utils';
import queryString from 'query-string';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { STORAGE_BOARD_KEY, STORAGE_PIPELINE_KEY } from '../constants';
import { queries } from '../graphql';
import {
  BoardDetailQueryResponse,
  BoardsGetLastQueryResponse,
  BoardsQueryResponse
} from '../types';

type Props = {
  type: string;
  component: any;
  middleContent?: () => React.ReactNode;
} & IRouterProps;

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  boardGetLastQuery?: BoardsGetLastQueryResponse;
  boardDetailQuery?: BoardDetailQueryResponse;
} & Props;

const FILTER_PARAMS = [
  'search',
  'userIds',
  'branchIds',
  'departmentIds',
  'priority',
  'assignedUserIds',
  'labelIds',
  'productIds',
  'companyIds',
  'customerIds',
  'segment',
  'assignedToMe',
  'closeDateType',
  'startDate',
  'endDate',
  'createdStartDate',
  'createdEndDate',
  'stateChangedStartDate',
  'stateChangedEndDate',
  'startDateStartDate',
  'startDateEndDate',
  'closeDateStartDate',
  'closeDateEndDate'
];

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

export const getBoardId = ({ location }) => {
  const queryParams = generateQueryParams({ location });
  return queryParams.id;
};

const defaultParams = ['id', 'pipelineId'];

/*
 * Main board component
 */
class Main extends React.Component<FinalProps> {
  onSearch = (search: string) => {
    if (!search) {
      return routerUtils.removeParams(this.props.history, 'search');
    }

    routerUtils.setParams(this.props.history, { search });
  };

  onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(this.props.history);

    if (params[key] === values) {
      return routerUtils.removeParams(this.props.history, key);
    }

    return routerUtils.setParams(this.props.history, { [key]: values });
  };

  isFiltered = (): boolean => {
    const params = generateQueryParams(this.props.history);

    for (const param in params) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  clearFilter = () => {
    const params = generateQueryParams(this.props.history);

    const remainedParams = Object.keys(params).filter(
      key => !defaultParams.includes(key)
    );

    routerUtils.removeParams(this.props.history, ...remainedParams);
  };

  render() {
    const {
      history,
      location,
      boardsQuery,
      boardGetLastQuery,
      boardDetailQuery,
      type,
      middleContent
    } = this.props;

    if (boardsQuery.loading) {
      return <PageHeader />;
    }

    const queryParams = generateQueryParams({ location });
    const boardId = getBoardId({ location });
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

    const lastBoard = boardGetLastQuery && boardGetLastQuery.boardGetLast;
    const currentBoard = boardDetailQuery && boardDetailQuery.boardDetail;

    // if there is no boardId in queryparams and there is one in localstorage
    // then put those in queryparams
    const [defaultBoardId, defaultPipelineId] = [
      defaultBoards[type],
      defaultPipelines[type]
    ];

    if (!boardId && defaultBoardId) {
      routerUtils.setParams(history, {
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

      routerUtils.setParams(history, {
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

      window.location.href = `/${type}/board`;
      return null;
    }

    const pipelines = currentBoard ? currentBoard.pipelines || [] : [];

    const currentPipeline = pipelineId
      ? pipelines.find(pipe => pipe._id === pipelineId)
      : pipelines[0];

    const props = {
      middleContent,
      onSearch: this.onSearch,
      queryParams,
      history,
      currentBoard,
      currentPipeline,
      boards: boardsQuery.boards || []
    };

    const extendedProps = {
      ...props,
      type,
      onSelect: this.onSelect,
      isFiltered: this.isFiltered,
      clearFilter: this.clearFilter
    };

    const Component = this.props.component;

    return <Component {...extendedProps} />;
  }
}

const MainActionBarContainer = withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
      name: 'boardsQuery',
      options: ({ type }) => ({
        variables: { type }
      })
    }),
    graphql<Props, BoardsGetLastQueryResponse>(gql(queries.boardGetLast), {
      name: 'boardGetLastQuery',
      skip: getBoardId,
      options: ({ type }) => ({
        variables: { type }
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
