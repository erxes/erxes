import * as compose from "lodash.flowright";
import * as routerUtils from "@erxes/ui/src/utils/router";

import { Alert, confirm, withProps } from "@erxes/ui/src/utils";
import { BoardsQueryResponse, RemoveBoardMutationResponse } from "../types";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { mutations, queries } from "../graphql";

import Boards from "../components/Boards";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import React from "react";
import { getWarningMessage } from "@erxes/ui-sales/src/boards/utils";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

type Props = {
  navigate?: any;
  location?: any;
  currentBoardId: string;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
} & Props &
  RemoveBoardMutationResponse;

class BoardsContainer extends React.Component<FinalProps> {
  render() {
    const { navigate, location, boardsQuery, removeMutation } = this.props;

    const boards = boardsQuery.calendarBoards || [];

    const removeHash = () => {
      if (location.hash.includes("showBoardModal")) {
        routerUtils.removeHash(navigate, location, "showBoardModal");
      }
    };

    // remove action
    const remove = boardId => {
      confirm(getWarningMessage("Board"), { hasDeleteConfirm: true }).then(
        () => {
          removeMutation({
            variables: { _id: boardId },
            refetchQueries: getRefetchQueries()
          })
            .then(() => {
              Alert.success("You successfully deleted a board");
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
            object ? "updated" : "added"
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
  return ["calendarBoards", "calendarBoardGetLast"];
};

const generateOptions = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse, {}>(gql(queries.boards), {
      name: "boardsQuery",
      options: () => ({
        variables: {}
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
