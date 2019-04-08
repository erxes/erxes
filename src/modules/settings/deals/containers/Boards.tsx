import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { STORAGE_BOARD_KEY } from 'modules/deals/constants';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Boards } from '../components';
import { mutations, queries } from '../graphql';
import {
  AddBoardMutationResponse,
  BoardsQueryResponse,
  EditBoardMutationResponse,
  RemoveBoardMutationResponse
} from '../types';

type Props = {
  history?: any;
  currentBoardId?: string;
};

type FinalProps = {
  boardsQuery: any;
} & Props &
  IRouterProps &
  AddBoardMutationResponse &
  EditBoardMutationResponse &
  RemoveBoardMutationResponse;

class BoardsContainer extends React.Component<FinalProps> {
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

            Alert.success('You successfully deleted a board');
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
          Alert.success(
            `You successfully ${board ? 'updated' : 'added'} a new board.`
          );

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

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse, {}>(gql(queries.boards), {
      name: 'boardsQuery'
    }),
    graphql<Props, AddBoardMutationResponse, {}>(gql(mutations.boardAdd), {
      name: 'addMutation',
      options: generateOptions()
    }),
    graphql<Props, EditBoardMutationResponse, {}>(gql(mutations.boardEdit), {
      name: 'editMutation',
      options: generateOptions()
    }),
    graphql<Props, RemoveBoardMutationResponse, {}>(
      gql(mutations.boardRemove),
      {
        name: 'removeMutation',
        options: generateOptions()
      }
    )
  )(withRouter<FinalProps>(BoardsContainer))
);
