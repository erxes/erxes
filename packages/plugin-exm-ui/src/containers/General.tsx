import React, { useState } from 'react';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';

import { queries } from '../graphql';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import { isEnabled } from '@erxes/ui/src/utils/core';

import General from '../components/General';
import { IExm } from '../types';

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
};

export default function GeneralContainer(props: Props) {
  const kbQuery = useQuery(gql(queries.knowledgeBaseTopics), {
    skip: !isEnabled('knowledgebase')
  });

  const [kbCategories, setKbCategories] = useState({});

  if (kbQuery.error) {
    return <ErrorMsg>{kbQuery.error.message}</ErrorMsg>;
  }

  const getKbCategories = (topicId: string) => {
    if (!isEnabled('knowledgebase')) {
      return;
    }

    client
      .query({
        query: gql(queries.knowledgeBaseCategories),
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
      kbTopics={
        kbQuery && kbQuery.data ? kbQuery.data.knowledgeBaseTopics || [] : []
      }
      kbCategories={kbCategories}
      getKbCategories={getKbCategories}
    />
  );
}
