import * as compose from "lodash.flowright";

import { ChildProps, graphql } from "@apollo/client/react/hoc";

import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { BoardsQueryResponse as PurchasesBoardsQueryResponse } from "@erxes/ui-purchases/src/boards/types";
import React from "react";
import { BoardsQueryResponse as SalesBoardsQueryResponse } from "@erxes/ui-sales/src/boards/types";
import SelectBoards from "../components/SelectBoardPipeline";
import Spinner from "@erxes/ui/src/components/Spinner";
import { BoardsQueryResponse as TasksBoardsQueryResponse } from "@erxes/ui-tasks/src/boards/types";
import { BoardsQueryResponse as TicketsBoardsQueryResponse } from "@erxes/ui-tickets/src/boards/types";
import { gql } from "@apollo/client";
import { mutations as purchasesMutations } from "@erxes/ui-purchases/src/settings/boards/graphql";
import { queries as purchasesQueries } from "@erxes/ui-purchases/src/boards/graphql";
import { mutations as salesMutations } from "@erxes/ui-sales/src/settings/boards/graphql";
import { queries as salesQueries } from "@erxes/ui-sales/src/boards/graphql";
import { mutations as tasksMutations } from "@erxes/ui-tasks/src/settings/boards/graphql";
import { queries as tasksQueries } from "@erxes/ui-tasks/src/boards/graphql";
import { mutations as ticketsMutations } from "@erxes/ui-tickets/src/settings/boards/graphql";
import { queries as ticketsQueries } from "@erxes/ui-tickets/src/boards/graphql";
import { withProps } from "@erxes/ui/src/utils";

type Props = {
  onChangeItems: (items: any) => any;
  selectedItems: any[];
  isRequired?: boolean;
  description?: string;
  type: string;
};

type FinalProps = {
  salesBoardsQuery: SalesBoardsQueryResponse;
  ticketsdBoardsQuery: TicketsBoardsQueryResponse;
  tasksBoardsQuery: TasksBoardsQueryResponse;
  purchasesBoardsQuery: PurchasesBoardsQueryResponse;
} & Props;

const SelectContainer = (props: ChildProps<FinalProps>) => {
  const {
    salesBoardsQuery,
    ticketsdBoardsQuery,
    tasksBoardsQuery,
    purchasesBoardsQuery,
    type,
  } = props;

  let boardsQuery:
    | SalesBoardsQueryResponse
    | TicketsBoardsQueryResponse
    | TasksBoardsQueryResponse
    | PurchasesBoardsQueryResponse
    | undefined;

  let mutations;

  let queryResponse;

  switch (type) {
    case "deal":
      boardsQuery = salesBoardsQuery;
      mutations = salesMutations;
      queryResponse = "salesBoards";
      break;
    case "ticket":
      boardsQuery = ticketsdBoardsQuery;
      mutations = ticketsMutations;
      queryResponse = "ticketsBoards";
      break;
    case "task":
      boardsQuery = tasksBoardsQuery;
      mutations = tasksMutations;
      queryResponse = "tasksBoards";
      break;
    case "purchase":
      boardsQuery = purchasesBoardsQuery;
      mutations = purchasesMutations;
      queryResponse = "purchasesBoards";
      break;
  }

  if (!boardsQuery) {
    return null;
  }

  const boards = boardsQuery[queryResponse] || [];

  if (boardsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      boardsQuery && boardsQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={mutations.boardAdd}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    boards,
    items: [],
    renderButton,
  };

  return <SelectBoards {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(salesQueries.boards),
      variables: {},
    },
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, SalesBoardsQueryResponse, { type: string }>(
      gql(salesQueries.boards),
      {
        name: "salesBoardsQuery",
        options: ({ type }) => ({
          variables: {
            type,
          },
          refetchQueries: getRefetchQueries,
        }),
      }
    ),
    graphql<Props, TicketsBoardsQueryResponse, { type: string }>(
      gql(ticketsQueries.boards),
      {
        name: "ticketsdBoardsQuery",
        options: ({ type }) => ({
          variables: {
            type,
          },
          refetchQueries: getRefetchQueries,
        }),
      }
    ),
    graphql<Props, TasksBoardsQueryResponse, { type: string }>(
      gql(tasksQueries.boards),
      {
        name: "tasksBoardsQuery",
        options: ({ type }) => ({
          variables: {
            type,
          },
          refetchQueries: getRefetchQueries,
        }),
      }
    ),
    graphql<Props, PurchasesBoardsQueryResponse, { type: string }>(
      gql(purchasesQueries.boards),
      {
        name: "purchasesBoardsQuery",
        options: ({ type }) => ({
          variables: {
            type,
          },
          refetchQueries: getRefetchQueries,
        }),
      }
    )
  )(SelectContainer)
);
