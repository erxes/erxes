const commonParamDefs = `$name: String!, $description: String, $html: String, $css: String, $siteId: String`;
const commonParams = `name: $name, description: $description, html: $html, css: $css, siteId: $siteId`;

const add = `
  mutation  digitalIncomeRoomPagesAdd(${commonParamDefs}) {
     digitalIncomeRoomPagesAdd(${commonParams}) {
      _id
    }
  }
`;

const edit = `
  mutation  digitalIncomeRoomPagesEdit($_id: String!, ${commonParamDefs}) {
     digitalIncomeRoomPagesEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const remove = `
  mutation  digitalIncomeRoomPagesRemove($_id: String!) {
     digitalIncomeRoomPagesRemove(_id: $_id) 
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
     digitalIncomeRoomContentTypesAdd(${typeParams}) {
      _id
      displayName
    }
  }
`;

const typesEdit = `
  mutation contentTypesEdit($_id: String!, ${typeParamDefs}) {
     digitalIncomeRoomContentTypesEdit(_id: $_id, ${typeParams}) {
      _id
    }
  }
`;

const typesRemove = `
  mutation contentTypesRemove($_id: String!) {
     digitalIncomeRoomContentTypesRemove(_id: $_id)
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
     digitalIncomeRoomEntriesAdd(${entryParams}) {
      _id
    }
  }
`;

const entriesEdit = `
  mutation entriesEdit($_id: String!, ${entryParamDefs}) {
     digitalIncomeRoomEntriesEdit(_id: $_id, ${entryParams}) {
      _id
    }
  }
`;

const entriesRemove = `
  mutation entriesRemove($_id: String!) {
     digitalIncomeRoomEntriesRemove(_id: $_id) 
  }
`;

const templatesUse = `
  mutation templatesUse($_id: String!, $name: String!, $coverImage: AttachmentInput) {
     digitalIncomeRoomTemplatesUse(_id: $_id, name: $name, coverImage: $coverImage) 
  }
`;

const sitesAdd = `
  mutation sitesAdd($name: String $domain: String) {
     digitalIncomeRoomSitesAdd(name: $name domain: $domain) {
      _id
    }
  }
`;

const sitesEdit = `
  mutation sitesEdit($_id: String! $name: String $domain: String) {
     digitalIncomeRoomSitesEdit(_id: $_id name: $name domain: $domain) {
      _id
    }
  }
`;

const sitesRemove = `
  mutation sitesRemove($_id: String!) {
     digitalIncomeRoomSitesRemove(_id: $_id) 
  }
`;

const sitesDuplicate = `
  mutation sitesDuplicate($_id: String!) {
     digitalIncomeRoomSitesDuplicate(_id: $_id) {
      _id
    }
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
  sitesRemove,
  sitesDuplicate
};
