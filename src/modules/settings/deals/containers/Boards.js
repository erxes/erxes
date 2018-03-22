import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { Boards } from '../components';

const BoardsContainer = props => {
  const { boardsQuery, addMutation, editMutation, removeMutation } = props;

  const boards = boardsQuery.dealBoards || [];

  // remove action
  const remove = _id => {
    confirm().then(() => {
      removeMutation({
        variables: { _id }
      })
        .then(() => {
          boardsQuery.refetch();

          Alert.success('Successfully deleted.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  // create or update action
  const save = ({ doc }, callback, board) => {
    let mutation = addMutation;

    // if edit mode
    if (board) {
      mutation = editMutation;
      doc._id = board._id;
    }

    mutation({
      variables: doc
    })
      .then(() => {
        boardsQuery.refetch();

        Alert.success('Successfully saved!');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...props,
    boards,
    save,
    remove,
    loading: boardsQuery.loading
  };

  return <Boards {...extendedProps} />;
};

BoardsContainer.propTypes = {
  boardsQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(mutations.boardAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.boardEdit), {
    name: 'editMutation'
  }),
  graphql(gql(mutations.boardRemove), {
    name: 'removeMutation'
  })
)(BoardsContainer);
