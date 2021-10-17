const commonFields = `
    $name: String,
    $description: String
`;

const commonFormParamsDef = `
  $name: String!,
  $brandId: String!,
`;

const commonFormParams = `
  name: $name,
  brandId: $brandId,
`;

const commonVariables = `
    name: $name,
    description: $description,
`;


const posAdd = `
  mutation posAdd(${commonFields}) {
    posAdd(${commonVariables}){
        _id
        name
        description
    }
  }
`;

const podEdit = `
  mutation podEdit($_id: String, ${commonFields}) {
    podEdit(_id: $_id, ${commonVariables}){
        _id
        name
        description
    }
  }
`;

const posRemove = `
  mutation posRemove($_id: String!) {
    posRemove(_id: $_id)
  }
`;

const updateConfigs = `
  mutation posConfigsUpdate($posId:String!, $configsMap: JSON!) {
    posConfigsUpdate(posId: $posId, configsMap: $configsMap)
  }
`;

const integrationRemove = `
  mutation integrationsRemove($_id: String!) {
    integrationsRemove(_id: $_id)
  }
`;

const integrationsArchive = `
  mutation integrationsArchive($_id: String!, $status: Boolean!) {
    integrationsArchive(_id: $_id, status: $status) {
      _id
    }
  }
`;

const integrationsEdit = `
  mutation integrationsEditLeadIntegration($_id: String!, ${commonFormParamsDef}) {
    integrationsEditLeadIntegration(_id: $_id, ${commonFormParams}) {
      _id
      ${commonFields}
    }
  }
`;

const brandAdd = `
  mutation brandsAdd(  $name: String!,
    $description: String,
    $emailConfig: JSON,) {
    brandsAdd(  name: $name,
      description: $description,
      emailConfig: $emailConfig,) {
      _id
    }
  }
`;

export default {
  posAdd,
  podEdit,
  posRemove,
  updateConfigs,
  integrationRemove,
  integrationsArchive,
  integrationsEdit,
  brandAdd
};
