import { gql } from '@apollo/client';

const TEMPLATE_FIELDS = `
  id
  pluginName
  version
  name
  description
  icon
  requirements
  parts
  journeys {
    key
    name
    description
    triggerType
    stepCount
    preview
  }
`;

const INSTALLATION_FIELDS = `
  _id
  templateId
  pluginName
  version
  name
  partIds
  automations {
    _id
    journey
    name
    status
  }
  createdBy
  createdAt
`;

export const TEMPLATES = gql`
  query templates {
    templates {
      ${TEMPLATE_FIELDS}
    }
  }
`;

export const TEMPLATE_DETAIL = gql`
  query templateDetail($pluginName: String!, $id: String!) {
    templateDetail(pluginName: $pluginName, id: $id) {
      ${TEMPLATE_FIELDS}
    }
  }
`;

export const TEMPLATE_INSTALLATIONS = gql`
  query templateInstallations {
    templateInstallations {
      ${INSTALLATION_FIELDS}
    }
  }
`;

export const TEMPLATE_INSTALLATION_DETAIL = gql`
  query templateInstallationDetail($_id: String!) {
    templateInstallationDetail(_id: $_id) {
      ${INSTALLATION_FIELDS}
    }
  }
`;
