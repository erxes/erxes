import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { STORAGE_BOARD_KEY } from 'modules/boards/constants';
import { BoardsQueryResponse } from 'modules/boards/types';
import { getDefaultBoardAndPipelines } from 'modules/boards/utils';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import routerUtils from 'modules/common/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Boards from '../components/Boards';
import { getWarningMessage } from '../constants';
import { mutations, queries } from '../graphql';
import { IOption, RemoveBoardMutationResponse } from '../types';

type Props = {
  history?: any;
  currentBoardId?: string;
  type: string;
  options?: IOption;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
} & Props &
  IRouterProps &
  RemoveBoardMutationResponse;

class BoardsContainer extends React.Component<FinalProps> {
  render() {
    const { history, boardsQuery, removeMutation, type } = this.props;

    const boards = boardsQuery.boards || [];

    const removeHash = () => {
      const { location } = history;

      if (location.hash.includes('showBoardModal')) {
        routerUtils.removeHash(history, 'showBoardModal');
      }
    };

    // remove action
    const remove = boardId => {
      confirm(getWarningMessage('Board'), { hasDeleteConfirm: true }).then(
        () => {
          removeMutation({
            variables: { _id: boardId },
            refetchQueries: getRefetchQueries()
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

              Alert.success('You successfully deleted a board');
            })
            .catch(error => {
              Alert.error(error.message);
            });
        }
      );
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
          beforeSubmit={removeHash}
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
      removeHash,
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
