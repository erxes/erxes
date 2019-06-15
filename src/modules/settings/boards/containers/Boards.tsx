import gql from 'graphql-tag';
import { STORAGE_BOARD_KEY } from 'modules/boards/constants';
import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import { IRouterProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
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
  type: string;
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
      removeMutation,
      type
    } = this.props;

    const boards = boardsQuery.boards || [];

    // remove action
    const remove = boardId => {
      confirm().then(() => {
        removeMutation({
          variables: { _id: boardId }
        })
          .then(() => {
            // if deleted board is default board
            const { defaultBoards } = getDefaultBoardAndPipelines();
            const defaultBoardId = defaultBoards[type];

            if (defaultBoardId === boardId) {
              delete defaultBoards[type];

              localStorage.setItem(
                STORAGE_BOARD_KEY,
                JSON.stringify(defaultBoards)
              );
            }

            history.push('/settings/boards/' + type);

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
  refetchQueries: ['boards', 'boardGetLast', 'pipelines']
});

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse, {}>(gql(queries.boards), {
      name: 'boardsQuery',
      options: ({ type }) => ({
        variables: { type }
      })
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
