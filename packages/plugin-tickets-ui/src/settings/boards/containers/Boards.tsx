import * as compose from "lodash.flowright";
import * as routerUtils from "@erxes/ui/src/utils/router";

import { Alert, confirm, withProps } from "@erxes/ui/src/utils";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IOption, RemoveBoardMutationResponse } from "../types";
import {
  mutations,
  queries
} from "@erxes/ui-tickets/src/settings/boards/graphql";

import Boards from "../components/Boards";
import { BoardsQueryResponse } from "@erxes/ui-tickets/src/boards/types";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import React from "react";
import { STORAGE_BOARD_KEY } from "@erxes/ui-tickets/src/boards/constants";
import { getDefaultBoardAndPipelines } from "@erxes/ui-tickets/src/boards/utils";
import { getWarningMessage } from "@erxes/ui-tickets/src/boards/utils";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  currentBoardId?: string;
  type: string;
  options?: IOption;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
} & Props &
  RemoveBoardMutationResponse;

function BoardsContainer(props: FinalProps) {
  const { boardsQuery, removeMutation, type } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const boards = boardsQuery.ticketsBoards || [];

  const removeHash = () => {
    if (location.hash.includes("showBoardModal")) {
      routerUtils.removeHash(navigate, "showBoardModal");
    }
  };

  // remove action
  const remove = boardId => {
    confirm(getWarningMessage("Board"), { hasDeleteConfirm: true }).then(() => {
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

          Alert.success("You successfully deleted a board");
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
        beforeSubmit={removeHash}
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${name}`}
      />
    );
  };

  const extendedProps = {
    ...props,
    boards,
    renderButton,
    remove,
    removeHash,
    loading: boardsQuery.loading
  };

  return <Boards {...extendedProps} />;
}

const getRefetchQueries = () => {
  return ["ticketsBoards", "ticketsBoardGetLast", "ticketsPipelines"];
};

const generateOptions = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse, {}>(gql(queries.boards), {
      name: "boardsQuery",
      options: ({ type }) => ({
        variables: { type }
      })
    }),
    graphql<Props, RemoveBoardMutationResponse, {}>(
      gql(mutations.boardRemove),
      {
        name: "removeMutation",
        options: generateOptions()
      }
    )
  )(BoardsContainer)
);
