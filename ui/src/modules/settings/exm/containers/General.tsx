import React, { useState } from 'react';
import client from 'apolloClient';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import General from '../components/General';
import { queries as leadQueries } from 'modules/leads/graphql';
import { queries as kbQueries } from 'modules/knowledgeBase/graphql';

type Props = {
  exm: any;
  edit: (variables: any) => void;
};

export default function GeneralContainer(props: Props) {
  const integrationQuery = useQuery(gql(leadQueries.integrations), {
    variables: { kind: 'lead' }
  });
  const kbQuery = useQuery(gql(kbQueries.knowledgeBaseTopics));
  const [kbCategories, setKbCategories] = useState({});

  if (integrationQuery.loading || kbQuery.loading) {
    return <div>...</div>;
  }

  const getKbCategories = (topicId: string) => {
    client
      .query({
        query: gql(kbQueries.knowledgeBaseCategories),
        fetchPolicy: 'network-only',
        variables: { topicIds: [topicId] }
      })
      .then(({ data }) => {
        setKbCategories({
          ...kbCategories,
          [topicId]: data ? data.knowledgeBaseCategories : []
        });
      });
  };

  return (
    <General
      {...props}
      kbTopics={kbQuery.data.knowledgeBaseTopics || []}
      kbCategories={kbCategories}
      getKbCategories={getKbCategories}
      forms={integrationQuery.data.integrations || []}
    />
  );
}
