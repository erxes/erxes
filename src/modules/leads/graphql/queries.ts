const integrations = `
  query leadIntegrations($perPage: Int, $page: Int, $kind: String, $tag: String) {
    integrations(perPage: $perPage, page: $page, kind: $kind, tag: $tag) {
      _id
      brandId
      name
      kind
      code
      brand {
        _id
        name
        code
      }
      languageCode
      leadData
      formId
      tags {
        _id
        name
        colorCode
      }
      tagIds
      form {
        _id
        title
        code
        description
        type
        buttonText
        createdDate
        createdUserId
        createdUser {
          _id
          details {
            avatar
            fullName
            position
          }
        }
      }
    }
  }
`;

const integrationDetail = `
  query integrationDetail($_id: String!) {
    integrationDetail(_id: $_id) {
      _id
      kind
      name
      brand {
        _id
        name
        code
      }
      languageCode
      brandId
      code
      formId
      leadData
      tagIds
      tags {
        _id
        name
        colorCode
      }
      form {
        _id
        title
        code
        description
        type
        buttonText
        createdDate
        createdUserId
        createdUser {
          _id
          details {
            avatar
            fullName
            position
          }
        }
      }
    }
  }
`;

const integrationsTotalCount = `
  query integrationsTotalCount {
    integrationsTotalCount {
      byKind
      byTag
    }
  }
`;
const tags = `
  query tags($type: String) {
    tags(type: $type) {
      _id
      name
      type
      colorCode
    }
  }
`;

const forms = `
  query forms {
    forms {
      _id
      title
    }
  }
`;

export default {
  integrations,
  integrationDetail,
  integrationsTotalCount,
  tags,
  forms
};
