import {
  BoardsQueryResponse,
  IPipeline
} from "@erxes/ui-tickets/src/boards/types";
import React, { useEffect, useState } from "react";
import General from "../../components/messenger/steps/TicketSelector";
import Spinner from "@erxes/ui/src/components/Spinner";
import boardQueries from "@erxes/ui-tickets/src/settings/boards/graphql/queries";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { useQuery } from "@apollo/client";

type Props = {
  handleFormChange: (name: string, value: string | boolean) => void;
  ticketPipelineId: string;
  ticketBoardId: string;
  ticketStageId: string;
};

function GeneralContainer(props: Props) {
  const [pipelines, setPipelines] = useState<IPipeline[]>([] as IPipeline[]);

  const boardsQuery = useQuery<BoardsQueryResponse>(gql(boardQueries.boards), {
    variables: { type: "ticket" },
    skip: isEnabled("tickets") ? false : true
  });

  const fetchPipelines = (boardId: string) => {
    client
      .query({
        query: gql(boardQueries.pipelines),
        variables: { boardId, type: "ticket" }
      })
      .then(({ data = {} }) => {
        setPipelines(data.ticketsPipelines || []);
      });
  };

  useEffect(() => {
    if (props.ticketBoardId) {
      fetchPipelines(props.ticketBoardId);
    }
  }, [props.ticketBoardId]);

  if (boardsQuery && boardsQuery.loading) {
    return <Spinner />;
  }

  const boards = (boardsQuery.data && boardsQuery.data.ticketsBoards) || [];

  const updatedProps = {
    ...props,
    boards,
    pipelines,
    tokenPassMethod: "cookie" as "cookie",
    fetchPipelines
  };
  return <General {...updatedProps} />;
}

export default GeneralContainer;
