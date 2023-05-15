import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';
import RelationForm from '../components/RelationForm';
import queries from '../queries';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IField } from '@erxes/ui/src/types';
import Info from '@erxes/ui/src/components/Info';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  contentType: string;
  insertedId?: string;
  onChange: (relations: any) => void;
};

const Container = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.relations), {
    variables: { contentType: props.contentType, isVisibleToCreate: true }
  });

  if (loading) {
    return <Spinner objective={true} />;
  }

  const fields: IField[] = data ? data.fieldsGetRelations || [] : [];

  if (fields.length === 0) {
    return (
      <Info>
        <a
          target="_blank"
          href={`/settings/properties?type=${props.contentType}`}
          rel="noopener noreferrer"
        >
          {__('You can configure relations in properties settings')}
        </a>
      </Info>
    );
  }

  return <RelationForm {...props} fields={fields} />;
};

export default Container;
