import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Home } from '../components';
import { queries } from '../graphql';

class HomeContainer extends React.Component<HomeContainerProps> {
  componentWillReceiveProps() {
    const { history, boardId } = this.props;

    if (!routerUtils.getParam(history, 'boardId') && boardId) {
      routerUtils.setParams(history, { boardId });
    }
  }

  render() {
    return <Home {...this.props} />;
  }
}

type HomeContainerProps = {
  history?: any,
  boardId: string
};

// Getting lastBoard id to currentBoard
const LastBoard = (props: LastBoardProps) => {
  const { boardGetLastQuery } = props;

  const lastBoard = boardGetLastQuery.dealBoardGetLast || {};

  const extendedProps = { ...props, boardId: lastBoard._id };

  return <HomeContainer {...extendedProps} />;
};

type LastBoardProps = {
  boardGetLastQuery: any
};

const LastBoardContainer = compose(
  graphql(gql(queries.boardGetLast), {
    name: 'boardGetLastQuery'
  })
)(LastBoard);

// Main home component
const MainContainer = (props: MainContainerProps) => {
  const { history } = props;
  const boardId = routerUtils.getParam(history, 'boardId');

  if (boardId) {
    const extendedProps = { ...props, boardId };

    return <HomeContainer {...extendedProps} />;
  }

  return <LastBoardContainer {...props} />;
};

type MainContainerProps = {
  history: any
};

export default withRouter(MainContainer);
