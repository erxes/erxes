import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { DealAddForm } from '../../components';
import { queries } from '../../graphql';

const DealAddFormContainer = props => {
  const { boardGetDefaultQuery } = props;

  if (boardGetDefaultQuery.loading) {
    return null;
  }

  const board = boardGetDefaultQuery.dealBoardGetDefault;

  const extendedProps = {
    ...props,
    boardId: board._id
  };

  return <DealAddForm {...extendedProps} />;
};

const propTypes = {
  boardGetDefaultQuery: PropTypes.object
};

DealAddFormContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.boardGetDefault), {
    name: 'boardGetDefaultQuery'
  })
)(DealAddFormContainer);
