import React, { useState } from 'react';
import client from 'apolloClient';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

import { queries as leadQueries } from 'modules/leads/graphql';
import { queries as kbQueries } from 'modules/knowledgeBase/graphql';
import ErrorMsg from 'modules/common/components/ErrorMsg';
import Spinner from 'modules/common/components/Spinner';

import General from '../components/General';
import { IExm } from '../types';

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
};

export default function GeneralContainer(props: Props) {
  const integrationQuery = useQuery(gql(leadQueries.integrations), {
    variables: { kind: 'lead' }
  });
  const kbQuery = useQuery(gql(kbQueries.knowledgeBaseTopics));
  const [kbCategories, setKbCategories] = useState({});

  if (integrationQuery.loading || kbQuery.loading) {
    return <Spinner />;
  }

  if (integrationQuery.error) {
    return <ErrorMsg>{integrationQuery.error.message}</ErrorMsg>;
  }

  if (kbQuery.error) {
    return <ErrorMsg>{kbQuery.error.message}</ErrorMsg>;
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
