import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Home } from '../components';
import { queries } from '../graphql';
import { BoardsGetLastQueryResponse } from '../types';
type HomeContainerProps = {
  history?: any;
  boardId: string;
};

type TypeProps = {
  type: string;
};

class HomeContainer extends React.Component<HomeContainerProps & TypeProps> {
  componentWillReceiveProps(nextProps) {
    const { history, boardId } = nextProps;

    if (!routerUtils.getParam(history, 'boardId') && boardId) {
      routerUtils.setParams(history, { boardId });
    }
  }

  render() {
    return <Home {...this.props} />;
  }
}

type LastBoardProps = {
  boardGetLastQuery: BoardsGetLastQueryResponse;
};

// Getting lastBoard id to currentBoard
const LastBoard = (props: LastBoardProps & TypeProps) => {
  const { boardGetLastQuery } = props;

  if (boardGetLastQuery.loading) {
    return <Spinner objective={true} />;
  }

  const lastBoard = boardGetLastQuery.boardGetLast || {};

  const extendedProps = {
    ...props,
    boardId: lastBoard._id
  };

  return <HomeContainer {...extendedProps} />;
};

type MainProps = IRouterProps & TypeProps;

const LastBoardContainer = withProps<MainProps>(
  compose(
    graphql<MainProps, BoardsGetLastQueryResponse, {}>(
      gql(queries.boardGetLast),
      {
        name: 'boardGetLastQuery',
        options: ({ type }) => ({
          variables: { type }
        })
      }
    )
  )(LastBoard)
);

// Main home component
const MainContainer = (props: MainProps) => {
  const { history } = props;
  const boardId = routerUtils.getParam(history, 'boardId');

  if (boardId) {
    const extendedProps = { ...props, boardId };

    return <HomeContainer {...extendedProps} />;
  }

  return <LastBoardContainer {...props} />;
};

export default withRouter<MainProps>(MainContainer);
