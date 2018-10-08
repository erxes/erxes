import gql from 'graphql-tag';
import { __, Alert, confirm } from 'modules/common/utils';
import { STORAGE_BOARD_KEY } from 'modules/deals/constants';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Boards } from '../components';
import { mutations, queries } from '../graphql';

type Props = {
  boardsQuery: any;
  addMutation: (params: { variables: { name: string } }) => Promise<any>;
  editMutation: (params: { variables: { name: string } }) => Promise<any>;
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

class BoardsContainer extends React.Component<Props, {}> {
  render() {
    const {
      boardsQuery,
      addMutation,
      editMutation,
      removeMutation
    } = this.props;

    const boards = boardsQuery.dealBoards || [];

    // remove action
    const remove = _id => {
      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(() => {
            boardsQuery.refetch();

            // if deleted board is default board
            if (localStorage.getItem(STORAGE_BOARD_KEY) === _id) {
              localStorage.removeItem(STORAGE_BOARD_KEY);
            }

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

    const extendedProps = {
      ...this.props,
      boards,
      save,
      remove,
      loading: boardsQuery.loading
    };

    return <Boards {...extendedProps} />;
  }
}

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
