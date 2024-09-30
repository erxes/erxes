import {
  BoardsQueryResponse,
  IPipeline
} from "@erxes/ui-tasks/src/boards/types";
import React, { useEffect, useState } from "react";

import General from "../components/forms/General";
import Spinner from "@erxes/ui/src/components/Spinner";
import { TopicsQueryResponse } from "@erxes/ui-knowledgebase/src/types";
import boardQueries from "@erxes/ui-tasks/src/settings/boards/graphql/queries";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import knowledgeBaseQueries from "@erxes/ui-knowledgebase/src/graphql/queries";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { useQuery } from "@apollo/client";

type Props = {
  handleFormChange: (name: string, value: string | boolean) => void;
  taskPublicPipelineId: string;
  taskPublicBoardId: string;
};

function GeneralContainer(props: Props) {
  const [pipelines, setPipelines] = useState<IPipeline[]>([] as IPipeline[]);

  const knowledgeBaseTopicsQuery = useQuery<TopicsQueryResponse>(
    gql(knowledgeBaseQueries.knowledgeBaseTopics),
    {
      skip: isEnabled("knowledgebase") ? false : true
    }
  );

  const boardsQuery = useQuery<BoardsQueryResponse>(gql(boardQueries.boards), {
    variables: { type: "task" },
    skip: isEnabled("tasks") ? false : true
  });

  const fetchPipelines = (boardId: string) => {
    client
      .query({
        query: gql(boardQueries.pipelines),
        variables: { boardId, type: "task" }
      })
      .then(({ data = {} }) => {
        setPipelines(data.tasksPipelines || []);
      });
  };

  useEffect(() => {
    if (props.taskPublicBoardId) {
      fetchPipelines(props.taskPublicBoardId);
    }
  }, [props.taskPublicBoardId]);

  if (
    (knowledgeBaseTopicsQuery && knowledgeBaseTopicsQuery.loading) ||
    (boardsQuery && boardsQuery.loading)
  ) {
    return <Spinner />;
  }

  const topics =
    (knowledgeBaseTopicsQuery.data &&
      knowledgeBaseTopicsQuery.data.knowledgeBaseTopics) ||
    [];
  const boards = (boardsQuery.data && boardsQuery.data.tasksBoards) || [];

  const updatedProps = {
    ...props,
    topics,
    boards,
    pipelines,
    tokenPassMethod: "cookie" as "cookie",
    fetchPipelines
  };

  return <General {...updatedProps} />;
}

export default GeneralContainer;
