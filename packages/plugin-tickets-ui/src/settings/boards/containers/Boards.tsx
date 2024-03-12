import * as compose from 'lodash.flowright';
import * as routerUtils from '@erxes/ui/src/utils/router';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { IOption, RemoveBoardMutationResponse } from '../types';
import {
  mutations,
  queries
} from '@erxes/ui-cards/src/settings/boards/graphql';

import Boards from '../components/Boards';
import { BoardsQueryResponse } from '@erxes/ui-cards/src/boards/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import React from 'react';
import { STORAGE_BOARD_KEY } from '@erxes/ui-cards/src/boards/constants';
import { getDefaultBoardAndPipelines } from '@erxes/ui-cards/src/boards/utils';
import { getWarningMessage } from '@erxes/ui-cards/src/boards/utils';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

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
