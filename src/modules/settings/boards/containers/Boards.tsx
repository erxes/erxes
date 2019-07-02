import gql from 'graphql-tag';
import { STORAGE_BOARD_KEY } from 'modules/boards/constants';
import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import { ButtonMutate } from 'modules/common/components';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Boards } from '../components';
import { mutations, queries } from '../graphql';
import { BoardsQueryResponse, RemoveBoardMutationResponse } from '../types';

type Props = {
  history?: any;
  currentBoardId?: string;
  type: string;
};

type FinalProps = {
  boardsQuery: any;
} & Props &
  IRouterProps &
  RemoveBoardMutationResponse;

class BoardsContainer extends React.Component<FinalProps> {
  render() {
    const { history, boardsQuery, removeMutation, type } = this.props;

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

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={object ? mutations.boardEdit : mutations.boardAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const extendedProps = {
      ...this.props,
      boards,
      renderButton,
      remove,
      loading: boardsQuery.loading
    };

    return <Boards {...extendedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['boards', 'boardGetLast', 'pipelines'];
};

const generateOptions = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse, {}>(gql(queries.boards), {
      name: 'boardsQuery',
      options: ({ type }) => ({
        variables: { type }
      })
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
