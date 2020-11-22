import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Home from '../components/Home';
import { queries } from '../graphql';
import { BoardGetLastQueryResponse } from '../types';

type MainProps = {
  history: any;
  queryParams: any;
};

type HomeContainerProps = MainProps & {
  boardId: string;
};

class HomeContainer extends React.Component<HomeContainerProps> {
  componentDidMount() {
    const { history, boardId, queryParams } = this.props;

    if (!queryParams.boardId && boardId) {
      routerUtils.setParams(history, { boardId });
    }
  }

  render() {
    return <Home {...this.props} />;
  }
}

type LastBoardProps = MainProps & {
  boardGetLastQuery: BoardGetLastQueryResponse;
};

// Getting lastBoard id to currentBoard
const LastBoard = (props: LastBoardProps) => {
  const { boardGetLastQuery } = props;

  if (boardGetLastQuery.loading) {
    return <Spinner objective={true} />;
  }

  const lastBoard = boardGetLastQuery.calendarBoardGetLast || {};

  const extendedProps = {
    ...props,
    boardId: lastBoard._id
  };

  return <HomeContainer {...extendedProps} />;
};

type HomerProps = { queryParams: any } & IRouterProps;

const LastBoardContainer = withProps<MainProps>(
  compose(
    graphql<MainProps, BoardGetLastQueryResponse, {}>(
      gql(queries.boardGetLast),
      {
        name: 'boardGetLastQuery'
      }
    )
  )(LastBoard)
);

// Main home component
const MainContainer = (props: HomerProps) => {
  const { history } = props;
  const boardId = routerUtils.getParam(history, 'boardId');

  if (boardId) {
    const extendedProps = { ...props, boardId };

    return <HomeContainer {...extendedProps} />;
  }

  return <LastBoardContainer {...props} />;
};

export default withRouter<HomerProps>(MainContainer);
