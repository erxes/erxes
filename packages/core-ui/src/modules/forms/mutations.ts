import { commonFields } from './queries';

const commonFormParamsDef = `
  $name: String!,
  $brandId: String!,
  $channelIds: [String]
`;

const commonFormParams = `
  name: $name,
  brandId: $brandId,
  channelIds: $channelIds,
`;

const integrationRemove = `
  mutation integrationsRemove($_id: String!) {
    integrationsRemove(_id: $_id)
  }
`;

const integrationsCreateLeadIntegration = `
  mutation integrationsCreateLeadIntegration(${commonFormParamsDef}) {
    integrationsCreateLeadIntegration(${commonFormParams}) {
      _id
    }
  }
`;

const integrationsEditLeadIntegration = `
  mutation integrationsEditLeadIntegration($_id: String!, ${commonFormParamsDef}) {
    integrationsEditLeadIntegration(_id: $_id, ${commonFormParams}) {
      _id
      ${commonFields}
    }
  }
`;

const formCopy = `
mutation FormsDuplicate($id: String!) {
  formsDuplicate(_id: $id) {
    _id
  }
}
`;

const formRemove = `
mutation FormsRemove($id: String!) {
  formsRemove(_id: $id)
}`

const formToggleStatus = `
mutation FormsToggleStatus($id: String!) {
  formsToggleStatus(_id: $id) {
    _id
  }
}
`

export default {
  integrationRemove,
  integrationsEditLeadIntegration,
  integrationsCreateLeadIntegration,
  formCopy,
  formRemove,
  formToggleStatus
};
