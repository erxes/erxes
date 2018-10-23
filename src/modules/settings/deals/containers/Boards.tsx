import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { __, Alert, confirm } from 'modules/common/utils';
import { STORAGE_BOARD_KEY } from 'modules/deals/constants';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Boards } from '../components';
import { mutations, queries } from '../graphql';

interface IProps extends IRouterProps {
  history: any;
  boardsQuery: any;
  currentBoardId?: string;
  addMutation: (params: { variables: { name: string } }) => Promise<any>;
  editMutation: (params: { variables: { name: string } }) => Promise<any>;
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
}

class BoardsContainer extends React.Component<IProps> {
  render() {
    const {
      history,
      boardsQuery,
      addMutation,
      editMutation,
      removeMutation
    } = this.props;

    const boards = boardsQuery.dealBoards || [];

    // remove action
    const remove = boardId => {
      confirm().then(() => {
        removeMutation({
          variables: { _id: boardId }
        })
          .then(() => {
            // if deleted board is default board
            if (localStorage.getItem(STORAGE_BOARD_KEY) === boardId) {
              localStorage.removeItem(STORAGE_BOARD_KEY);
            }

            history.push('/settings/deals/');
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

const generateOptions = () => ({
  refetchQueries: ['dealBoards', 'dealBoardGetLast', 'dealPipelines']
});

export default compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(mutations.boardAdd), {
    name: 'addMutation',
    options: generateOptions()
  }),
  graphql(gql(mutations.boardEdit), {
    name: 'editMutation',
    options: generateOptions()
  }),
  graphql(gql(mutations.boardRemove), {
    name: 'removeMutation',
    options: generateOptions()
  })
)(withRouter<IProps>(BoardsContainer));
