const variables = `
    $code: String!
    $name: String!
    $bounds: JSON
    $location: JSON
    $customerIds: [String]
    $description: String
    $osmbId: String
    $quarterId: String
    $type: String
    $serviceStatus: ServiceStatus
    $suhId: String
`;

const fields = `
    code: $code
    name: $name
    bounds: $bounds
    location: $location
    customerIds: $customerIds
    description: $description
    osmbId: $osmbId
    quarterId: $quarterId
    type: $type
    serviceStatus: $serviceStatus
    suhId: $suhId
`;

const addMutation = `
mutation BuildingsAdd(${variables}) {
  buildingsAdd(${fields}) {
    _id
  }
}
`;

const editMutation = `
mutation BuildingsEdit($_id: String!, ${variables}) {
    buildingsEdit(_id: $_id, ${fields}) {
        _id
    }
}
`;

const removeMutation = `
mutation BuildingsRemove($_ids: [String]) {
    buildingsRemove(_ids: $_ids)
}
`;

const buildingsUpdate = `
  mutation buildingsUpdate($_id: String!, $customerIds: [String], $companyIds: [String], $assetIds: [String]) {
    buildingsUpdate(_id: $_id, customerIds: $customerIds, companyIds: $companyIds, assetIds: $assetIds) {
      _id
    }
  }
`;

export default {
  addMutation,
  editMutation,
  removeMutation,
  buildingsUpdate
};
