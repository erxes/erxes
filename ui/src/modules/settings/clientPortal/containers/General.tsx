import Spinner from 'erxes-ui/lib/components/Spinner';
import gql from 'graphql-tag';
import compose from 'lodash.flowright';
import { TopicsQueryResponse } from 'modules/knowledgeBase/types';
import React from 'react';
import { graphql } from 'react-apollo';
import knowledgeBaseQueries from '../../../knowledgeBase/graphql/queries';
import { GeneralFormType } from '../components/Form';
import General from '../components/forms/General';

type Props = {
  handleFormChange: (name: string, value: string) => void;
  knowledgeBaseTopicsQuery: TopicsQueryResponse;
} & GeneralFormType;

function GeneralContainer(props: Props) {
  const { knowledgeBaseTopicsQuery } = props;

  if (knowledgeBaseTopicsQuery.loading) {
    return <Spinner />;
  }

  const topics = knowledgeBaseTopicsQuery.knowledgeBaseTopics || [];

  return <General {...props} topics={topics} />;
}

export default compose(
  graphql(gql(knowledgeBaseQueries.knowledgeBaseTopics), {
    name: 'knowledgeBaseTopicsQuery'
  })
)(GeneralContainer);
