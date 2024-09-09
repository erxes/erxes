import * as compose from "lodash.flowright";

import {
  BoardsGetLastQueryResponse,
  IBoard
} from "@erxes/ui-purchases/src/boards/types";
import { router as routerUtils, withProps } from "@erxes/ui/src/utils";

import Home from "../components/Home";
import { IOption } from "../types";
import React, { useEffect } from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "@erxes/ui-purchases/src/settings/boards/graphql";
import { useLocation, useNavigate } from "react-router-dom";

type HomeContainerProps = {
  boardId: string;
};

type Props = {
  type: string;
  title: string;
  options?: IOption;
};

function HomeContainer(props: HomeContainerProps & Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const { boardId } = props;

  useEffect(() => {
    if (!routerUtils.getParam(location, "boardId") && boardId) {
      routerUtils.setParams(navigate, location, { boardId });
    }
  }, [boardId, location, navigate]);

  return <Home {...props} />;
}

type LastBoardProps = {
  boardGetLastQuery: BoardsGetLastQueryResponse;
};

// Getting lastBoard id to currentBoard
const LastBoard = (props: LastBoardProps & Props) => {
  const { boardGetLastQuery } = props;

  if (boardGetLastQuery.loading) {
    return <Spinner objective={true} />;
  }

  const lastBoard = boardGetLastQuery.purchasesBoardGetLast || ({} as IBoard);

  const extendedProps = {
    ...props,
    boardId: lastBoard._id
  };

  return <HomeContainer {...extendedProps} />;
};

const LastBoardContainer = withProps<Props>(
  compose(
    graphql<Props, BoardsGetLastQueryResponse, {}>(gql(queries.boardGetLast), {
      name: "boardGetLastQuery",
      options: ({ type }) => ({
        variables: { type }
      })
    })
  )(LastBoard)
);

// Main home component
const MainContainer = (props: Props) => {
  const location = useLocation();

  const boardId = routerUtils.getParam(location, "boardId");

  if (boardId) {
    const extendedProps = { ...props, boardId };

    return <HomeContainer {...extendedProps} />;
  }

  return <LastBoardContainer {...props} />;
};

export default MainContainer;
