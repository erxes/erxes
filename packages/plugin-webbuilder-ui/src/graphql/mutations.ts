const commonParamDefs = `$name: String!, $description: String, $html: String, $css: String, $jsonData: JSON $siteId: String`;
const commonParams = `name: $name, description: $description, html: $html, css: $css, jsonData: $jsonData siteId: $siteId`;

const add = `
  mutation webbuilderPagesAdd(${commonParamDefs}) {
    webbuilderPagesAdd(${commonParams}) {
      _id
    }
  }
`;

const edit = `
  mutation webbuilderPagesEdit($_id: String!, ${commonParamDefs}) {
    webbuilderPagesEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const remove = `
  mutation webbuilderPagesRemove($_id: String!) {
    webbuilderPagesRemove(_id: $_id) 
  }
`;

const typeParamDefs = `
  $displayName: String
  $code: String
  $fields: JSON
  $siteId: String
`;

const typeParams = `
  displayName: $displayName
  code: $code
  fields: $fields
  siteId: $siteId
`;

const typesAdd = `
  mutation contentTypesAdd(${typeParamDefs}) {
    webbuilderContentTypesAdd(${typeParams}) {
      _id
      displayName
    }
  }
`;

const typesEdit = `
  mutation contentTypesEdit($_id: String!, ${typeParamDefs}) {
    webbuilderContentTypesEdit(_id: $_id, ${typeParams}) {
      _id
    }
  }
`;

const typesRemove = `
  mutation contentTypesRemove($_id: String!) {
    webbuilderContentTypesRemove(_id: $_id)
  }
`;

const entryParamDefs = `
  $contentTypeId: String!
  $values: JSON
`;

const entryParams = `
  contentTypeId: $contentTypeId
  values: $values
`;

const entriesAdd = `
  mutation entriesAdd(${entryParamDefs}) {
    webbuilderEntriesAdd(${entryParams}) {
      _id
    }
  }
`;

const entriesEdit = `
  mutation entriesEdit($_id: String!, ${entryParamDefs}) {
    webbuilderEntriesEdit(_id: $_id, ${entryParams}) {
      _id
    }
  }
`;

const entriesRemove = `
  mutation entriesRemove($_id: String!) {
    webbuilderEntriesRemove(_id: $_id) 
  }
`;

const templatesUse = `
  mutation templatesUse($_id: String!, $name: String!) {
    webbuilderTemplatesUse(_id: $_id, name: $name) 
  }
`;

const sitesAdd = `
  mutation sitesAdd($name: String $domain: String) {
    webbuilderSitesAdd(name: $name domain: $domain) {
      _id
    }
  }
`;

const sitesEdit = `
  mutation sitesEdit($_id: String! $name: String $domain: String) {
    webbuilderSitesEdit(_id: $_id name: $name domain: $domain) {
      _id
    }
  }
`;

const sitesRemove = `
  mutation sitesRemove($_id: String!) {
    webbuilderSitesRemove(_id: $_id) 
  }
`;

export default {
  add,
  edit,
  remove,
  typesAdd,
  typesEdit,
  typesRemove,
  entriesAdd,
  entriesEdit,
  entriesRemove,
  templatesUse,
  sitesAdd,
  sitesEdit,
  sitesRemove
};
