import {
  BoardsQueryResponse,
  IPipeline
} from '@erxes/ui-cards/src/boards/types';
import React, { useEffect, useState } from 'react';

import General from '../components/forms/General';
import Spinner from '@erxes/ui/src/components/Spinner';
import { TopicsQueryResponse } from '@erxes/ui-knowledgebase/src/types';
import boardQueries from '@erxes/ui-cards/src/settings/boards/graphql/queries';
import client from '@erxes/ui/src/apolloClient';
import compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import knowledgeBaseQueries from '@erxes/ui-knowledgebase/src/graphql/queries';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  handleFormChange: (name: string, value: string | boolean) => void;
  knowledgeBaseTopicsQuery: TopicsQueryResponse;
  boardsQuery: BoardsQueryResponse;
  taskPublicPipelineId: string;
  taskPublicBoardId: string;
};

function GeneralContainer(props: Props) {
  const { knowledgeBaseTopicsQuery, boardsQuery } = props;
  const [pipelines, setPipelines] = useState<IPipeline[]>([] as IPipeline[]);

  const fetchPipelines = (boardId: string) => {
    client
      .query({
        query: gql(boardQueries.pipelines),
        variables: { boardId, type: 'task' }
      })
      .then(({ data = {} }) => {
        setPipelines(data.pipelines || []);
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
    (knowledgeBaseTopicsQuery &&
      knowledgeBaseTopicsQuery.knowledgeBaseTopics) ||
    [];
  const boards = (boardsQuery && boardsQuery.boards) || [];

  const updatedProps = {
    ...props,
    topics,
    boards,
    pipelines,
    fetchPipelines
  };

  return <General {...updatedProps} />;
}

export default compose(
  graphql(gql(knowledgeBaseQueries.knowledgeBaseTopics), {
    name: 'knowledgeBaseTopicsQuery',
    skip: isEnabled('knowledgebase') ? false : true
  }),
  graphql(gql(boardQueries.boards), {
    name: 'boardsQuery',
    options: () => ({
      variables: { type: 'task' }
    }),
    skip: isEnabled('cards') ? false : true
  })
)(GeneralContainer);
