import client from 'erxes-ui/lib/apolloClient';
import Spinner from 'erxes-ui/lib/components/Spinner';
import gql from 'graphql-tag';
import compose from 'lodash.flowright';
import { BoardsQueryResponse, IPipeline } from 'modules/boards/types';
import { TopicsQueryResponse } from 'modules/knowledgeBase/types';
import React, { useEffect, useState } from 'react';
import { graphql } from 'react-apollo';
import knowledgeBaseQueries from '../../../knowledgeBase/graphql/queries';
import boardQueries from '../../boards/graphql/queries';
import General from '../components/forms/General';

type Props = {
  handleFormChange: (name: string, value: string) => void;
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

  if (knowledgeBaseTopicsQuery.loading || boardsQuery.loading) {
    return <Spinner />;
  }

  const topics = knowledgeBaseTopicsQuery.knowledgeBaseTopics || [];
  const boards = boardsQuery.boards || [];

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
    name: 'knowledgeBaseTopicsQuery'
  }),
  graphql(gql(boardQueries.boards), {
    name: 'boardsQuery',
    options: () => ({
      variables: { type: 'task' }
    })
  })
)(GeneralContainer);
