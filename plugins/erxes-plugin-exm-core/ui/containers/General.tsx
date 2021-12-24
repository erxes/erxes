import React, { useState } from 'react';
import client from 'erxes-ui/lib/apolloClient';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

import { queries } from '../graphql';
import ErrorMsg from 'erxes-ui/lib/components/ErrorMsg';
import Spinner from 'erxes-ui/lib/components/Spinner';

import General from '../components/General';
import { IExm } from '../types';

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
};

export default function GeneralContainer(props: Props) {
  const brandsQuery = useQuery(gql(queries.allBrands), {
    variables: { kind: 'lead' }
  });
  const kbQuery = useQuery(gql(queries.knowledgeBaseTopics));
  const [kbCategories, setKbCategories] = useState({});

  if (brandsQuery.loading || kbQuery.loading) {
    return <Spinner />;
  }

  if (brandsQuery.error) {
    return <ErrorMsg>{brandsQuery.error.message}</ErrorMsg>;
  }

  if (kbQuery.error) {
    return <ErrorMsg>{kbQuery.error.message}</ErrorMsg>;
  }

  const getKbCategories = (topicId: string) => {
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
      kbTopics={kbQuery.data.knowledgeBaseTopics || []}
      kbCategories={kbCategories}
      getKbCategories={getKbCategories}
      brands={brandsQuery.data.allBrands || []}
    />
  );
}
