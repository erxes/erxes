import React, { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";

import { queries } from "../graphql";
import ErrorMsg from "@erxes/ui/src/components/ErrorMsg";
import Spinner from "@erxes/ui/src/components/Spinner";
import { isEnabled } from "@erxes/ui/src/utils/core";

import { IExm } from "../types";
import Appearance from "../components/Appearance";
import boardQueries from "@erxes/ui-tickets/src/settings/boards/graphql/queries";
import client from "@erxes/ui/src/apolloClient";
import { IPipeline } from "@erxes/ui-tasks/src/boards/types";
import { IButtonMutateProps } from "@erxes/ui/src/types";

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

export default function AppearanceContainer(props: Props) {
  const { exm } = props;

  const [pipelines, setPipelines] = useState<IPipeline[]>([] as IPipeline[]);

  const kbQuery = useQuery(gql(queries.knowledgeBaseTopics), {
    skip: !isEnabled("knowledgebase")
  });

  const boardsQuery = useQuery(gql(boardQueries.boards), {
    variables: { type: "ticket" },
    skip: !isEnabled("tickets")
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
    if (exm.ticketBoardId) {
      fetchPipelines(exm.ticketBoardId);
    }
  }, [exm.ticketBoardId]);

  if (kbQuery.loading || boardsQuery.loading) {
    return <Spinner />;
  }

  if (kbQuery.error) {
    return <ErrorMsg>{kbQuery.error.message}</ErrorMsg>;
  }

  return (
    <Appearance
      {...props}
      kbTopics={
        kbQuery && kbQuery.data ? kbQuery.data.knowledgeBaseTopics || [] : []
      }
      boards={
        boardsQuery && boardsQuery.data
          ? boardsQuery.data.ticketsBoards || []
          : []
      }
      pipelines={pipelines}
      fetchPipelines={fetchPipelines}
    />
  );
}
