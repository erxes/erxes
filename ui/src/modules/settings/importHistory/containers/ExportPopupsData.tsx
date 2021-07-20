import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries } from '../graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import ExportPopupsData from '../components/ExportPopupsData';
import { ILeadIntegration } from 'modules/leads/types';

type AllLeadIntegrationsQueryResponse = {
  allLeadIntegrations: ILeadIntegration[];
};

interface IProps {
  allLeadIntegrationsQuery: AllLeadIntegrationsQueryResponse;
}

const ExportPopupsDataContainer = (props: IProps) => {
  const { allLeadIntegrationsQuery } = props;

  const popups = allLeadIntegrationsQuery.allLeadIntegrations || [];

  return <ExportPopupsData popups={popups} />;
};

export default compose(
  graphql<{}, AllLeadIntegrationsQueryResponse, {}>(
    gql(queries.allLeadIntegrations),
    {
      name: 'allLeadIntegrationsQuery'
    }
  )
)(ExportPopupsDataContainer);
