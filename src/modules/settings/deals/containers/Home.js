import * as React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import { Home } from '../components';
import { queries } from '../graphql';

class HomeContainer extends React.Component {
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

HomeContainer.propTypes = {
  history: PropTypes.object,
  boardId: PropTypes.string
};

// Getting lastBoard id to currentBoard
const LastBoard = props => {
  const { boardGetLastQuery } = props;

  const lastBoard = boardGetLastQuery.dealBoardGetLast || {};

  const extendedProps = { ...props, boardId: lastBoard._id };

  return <HomeContainer {...extendedProps} />;
};

LastBoard.propTypes = {
  boardGetLastQuery: PropTypes.object
};

const LastBoardContainer = compose(
  graphql(gql(queries.boardGetLast), {
    name: 'boardGetLastQuery'
  })
)(LastBoard);

// Main home component
const MainContainer = props => {
  const { history } = props;
  const boardId = routerUtils.getParam(history, 'boardId');

  if (boardId) {
    const extendedProps = { ...props, boardId };

    return <HomeContainer {...extendedProps} />;
  }

  return <LastBoardContainer {...props} />;
};

MainContainer.propTypes = {
  history: PropTypes.object
};

export default withRouter(MainContainer);
