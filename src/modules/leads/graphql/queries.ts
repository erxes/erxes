const integrations = `
  query leadIntegrations($perPage: Int, $page: Int, $kind: String, $tag: String) {
    integrations(perPage: $perPage, page: $page, kind: $kind, tag: $tag) {
      _id
      brandId
      name
      kind
      brand {
        _id
        name
        code
      }
      languageCode
      leadData
      leadId
      tags {
        _id
        name
        colorCode
      }
      tagIds
      lead {
        _id
        formId
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
        themeColor
        contactsGathered
        viewCount
        callout {
          title
          body
          buttonText
          featuredImage
          skip
        }
        rules {
          _id
          kind
          text
          condition
          value
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
      leadId
      leadData
      tagIds
      tags {
        _id
        name
        colorCode
      }
      lead {
        _id
        formId
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
        themeColor
        contactsGathered
        viewCount
        callout {
          title
          body
          buttonText
          featuredImage
          skip
        }
        rules {
          _id
          kind
          text
          condition
          value
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
