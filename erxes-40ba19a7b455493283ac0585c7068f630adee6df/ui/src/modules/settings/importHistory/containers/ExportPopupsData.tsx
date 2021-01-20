import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries } from 'modules/leads/graphql';
import { LeadIntegrationsQueryResponse } from 'modules/leads/types';
import React from 'react';
import { graphql } from 'react-apollo';
import ExportPopupsData from '../components/ExportPopupsData';

interface IProps {
  popupsQuery: LeadIntegrationsQueryResponse;
}

const ExportPopupsDataContainer = (props: IProps) => {
  const { popupsQuery } = props;

  const popups = popupsQuery.integrations || [];

  return <ExportPopupsData popups={popups} />;
};

export default compose(
  graphql(gql(queries.integrations), {
    name: 'popupsQuery',
    options: () => ({
      variables: {
        kind: 'lead'
      }
    })
  })
)(ExportPopupsDataContainer);
