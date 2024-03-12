import * as compose from 'lodash.flowright';

import {
  BoardsGetLastQueryResponse,
  IBoard
} from '@erxes/ui-cards/src/boards/types';
import { router as routerUtils, withProps } from '@erxes/ui/src/utils';

import Home from '../components/Home';
import { IOption } from '../types';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui-cards/src/settings/boards/graphql';
import { withRouter } from 'react-router-dom';

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

  const lastBoard = boardGetLastQuery.boardGetLast || ({} as IBoard);

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
