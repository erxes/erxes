const list = `
  query listQuery {
    xyps {
      _id
      name
      url
      token
      createdAt

    }
  }
`;

const totalCount = `
  query xypsTotalCount{
    xypsTotalCount
  }
`;

const paramDefs = `
  $serviceName: String,
  $responseKey: String,
  $objectType: String,
  $fieldGroup: String,
  $formField: String,
  $title: String,
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int,
`;

const params = `
  serviceName: $serviceName,
  responseKey: $responseKey,
  objectType: $objectType,
  fieldGroup: $fieldGroup,
  formField: $formField,
  title: $title,
  page: $page,
  perPage: $perPage,
  sortField: $sortField,
  sortDirection: $sortDirection,
`
const xypSyncRules = `
  query xypSyncRules(${paramDefs}) {
    xypSyncRules(${params}) {
      _id
      title
      serviceName
      responseKey
      extractType
      extractKey

      objectType
      fieldGroup
      formField

      createdBy
      createdAt
      updatedBy
      updatedAt

      fieldGroupObj
      formFieldObj
    }
  }
`;

const xypSyncRulesCount = `
  query xypSyncRulesCount(${paramDefs}) {
    xypSyncRulesCount(${params})
  }
`;

const xypSyncRulesDetail = `
  query xypSyncRulesDetail($_id: String!) {
    xypSyncRulesDetail(_id: $_id)
  }
`;

export default {
  list,
  totalCount,
  xypSyncRules,
  xypSyncRulesCount,
  xypSyncRulesDetail
};
