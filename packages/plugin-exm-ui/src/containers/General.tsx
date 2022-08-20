import React, { useState } from 'react';
import client from '@erxes/ui/src/apolloClient';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

import { queries } from '../graphql';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import Spinner from '@erxes/ui/src/components/Spinner';
import { isEnabled } from '@erxes/ui/src/utils/core';

import General from '../components/General';
import { IExm } from '../types';
import { Alert } from '@erxes/ui/src/utils';

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
};

export default function GeneralContainer(props: Props) {
  const brandsQuery = useQuery(gql(queries.allBrands), {
    variables: { kind: 'lead' }
  });
  const kbQuery = useQuery(gql(queries.knowledgeBaseTopics), {
    skip: !isEnabled('knowledgebase')
  });

  const [kbCategories, setKbCategories] = useState({});
  const [forms, setForms] = useState([]);

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

  const getForms = (brandId: string) => {
    if (!isEnabled('inbox')) {
      return;
    }

    client
      .query({
        query: gql(queries.integrations),
        fetchPolicy: 'network-only',
        variables: { brandId, kind: 'lead' }
      })
      .then(({ data }) => {
        setForms(data.integrations);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return (
    <General
      {...props}
      forms={forms}
      getForms={getForms}
      kbTopics={
        kbQuery && kbQuery.data ? kbQuery.data.knowledgeBaseTopics || [] : []
      }
      kbCategories={kbCategories}
      getKbCategories={getKbCategories}
      brands={brandsQuery.data.allBrands || []}
    />
  );
}
