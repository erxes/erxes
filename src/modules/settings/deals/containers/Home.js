import React from 'react';
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

// Getting defaultBoard id to currentBoard
const DefaultBoard = props => {
  const { boardGetDefaultQuery } = props;

  const defaultBoard = boardGetDefaultQuery.dealBoardGetDefault || {};

  const extendedProps = { ...props, boardId: defaultBoard._id };

  return <HomeContainer {...extendedProps} />;
};

DefaultBoard.propTypes = {
  boardGetDefaultQuery: PropTypes.object
};

const DefaultBoardContainer = compose(
  graphql(gql(queries.boardGetDefault), {
    name: 'boardGetDefaultQuery'
  })
)(DefaultBoard);

// Main home component
const MainContainer = props => {
  const { history } = props;
  const boardId = routerUtils.getParam(history, 'boardId');

  if (boardId) {
    const extendedProps = { ...props, boardId };

    return <HomeContainer {...extendedProps} />;
  }

  return <DefaultBoardContainer {...props} />;
};

MainContainer.propTypes = {
  history: PropTypes.object
};

export default withRouter(MainContainer);
