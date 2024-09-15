const add = `
  mutation xypAdd($name: String!, $url:String!,$token:String!) {
    xypAdd(name:$name, url: $url, token:$token) {
      name
      _id
      token
      name
      url
    }
  }
`;

const remove = `
  mutation xypRemove($_id: String!){
    xypRemove(_id: $_id)
  }
`;

const edit = `
  mutation xypEdit($_id: String!, $name: String!, $url:String!,$token:String!){
    xypEdit(_id: $_id, name: $name, url:$url, token:$token){
      _id
    }
  }
`;

const SyncRuleFields = `
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
`
const syncRuleParamDefs = `
  $title: String
  $serviceName: String
  $responseKey: String
  $extractType: String
  $extractKey: String

  $objectType: String
  $fieldGroup: String
  $formField: String
`;
const syncRuleParams = `
  title: $title
  serviceName: $serviceName
  responseKey: $responseKey
  extractType: $extractType
  extractKey: $extractKey

  objectType: $objectType
  fieldGroup: $fieldGroup
  formField: $formField
`;

const xypSyncRuleAdd = `
  mutation xypSyncRuleAdd(${syncRuleParamDefs}) {
    xypSyncRuleAdd(${syncRuleParams}) {
      ${SyncRuleFields}
    }
  }
`;

const xypSyncRuleEdit = `
  mutation xypSyncRuleEdit($_id: String, ${syncRuleParamDefs}) {
    xypSyncRuleEdit(_id: $_id, ${syncRuleParams}) {
      ${SyncRuleFields}
    }
  }
`;

const xypSyncRuleRemove = `
  mutation xypSyncRuleRemove($_id: String) {
    xypSyncRuleRemove(_id: $_id)
  }
`;
export default {
  add,
  remove,
  edit,
  xypSyncRuleAdd,
  xypSyncRuleEdit,
  xypSyncRuleRemove,
};
