import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { Boards } from '../components';

class BoardsContainer extends React.Component {
  render() {
    const {
      boardsQuery,
      addMutation,
      editMutation,
      removeMutation,
      setDefaultMutation
    } = this.props;

    const { __ } = this.context;

    const boards = boardsQuery.dealBoards || [];

    // remove action
    const remove = _id => {
      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(() => {
            boardsQuery.refetch();

            Alert.success(__('Successfully deleted.'));
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

          Alert.success(__('Successfully saved.'));

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    // set default
    const setDefault = _id => {
      setDefaultMutation({
        variables: { _id }
      })
        .then(() => {
          boardsQuery.refetch();

          Alert.success(__('Successfully selected.'));
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const extendedProps = {
      ...this.props,
      boards,
      save,
      remove,
      setDefault,
      loading: boardsQuery.loading
    };

    return <Boards {...extendedProps} />;
  }
}

BoardsContainer.propTypes = {
  boardsQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func,
  setDefaultMutation: PropTypes.func
};

BoardsContainer.contextTypes = {
  __: PropTypes.func
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
  }),
  graphql(gql(mutations.boardSetDefault), {
    name: 'setDefaultMutation'
  })
)(BoardsContainer);
