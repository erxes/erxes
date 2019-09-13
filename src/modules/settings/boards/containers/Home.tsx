import gql from 'graphql-tag';
import { BoardsGetLastQueryResponse } from 'modules/boards/types';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import Home from '../components/Home';
import { queries } from '../graphql';
import { IOption } from '../types';

type HomeContainerProps = {
  history?: any;
  boardId: string;
};

type Props = {
  type: string;
  title: string;
  options?: IOption;
};

class HomeContainer extends React.Component<HomeContainerProps & Props> {
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
const LastBoard = (props: LastBoardProps & Props) => {
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

type MainProps = IRouterProps & Props;

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
