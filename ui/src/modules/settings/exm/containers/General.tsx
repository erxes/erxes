import React from 'react';
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

  if (integrationQuery.loading || kbQuery.loading) {
    return <div>...</div>;
  }

  return (
    <General
      {...props}
      kbTopics={kbQuery.data.knowledgeBaseTopics || []}
      forms={integrationQuery.data.integrations || []}
    />
  );
}
