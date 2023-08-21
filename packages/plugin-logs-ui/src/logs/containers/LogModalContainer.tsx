import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import LogModal from '../components/LogModalContent';
import queries from '../queries';
import { ILog, SchemaLabelsQueryResponse } from '../types';

type Props = {
  schemaLabelsQuery: SchemaLabelsQueryResponse;
  log: ILog;
};

const LogModalContainer = (props: Props) => {
  const { schemaLabelsQuery, log } = props;

  if (!log) {
    return null;
  }

  if (schemaLabelsQuery.loading) {
    return <Spinner />;
  }

  return (
    <LogModal
      log={log}
      schemaLabelMaps={schemaLabelsQuery.getDbSchemaLabels || []}
    />
  );
};

export default compose(
  graphql<Props, SchemaLabelsQueryResponse>(gql(queries.getDbSchemaLabels), {
    name: 'schemaLabelsQuery',
    options: ({ log }) => ({ variables: { type: log.type } })
  })
)(LogModalContainer);
