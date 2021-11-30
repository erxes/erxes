const exmGet = `
  query exmGet {
    exmGet {
      _id
      name
      description
      createdAt
      
      features {
        _id
        icon
        name
        description
        contentType
        contentId
        subContentId
      }
      
      welcomeContent {
        _id
        title
        content
        image
      }
      
      appearance {
        primaryColor
        secondaryColor
      }
      
      logo
    }
  }
`;

const categoryFields = `
  _id
  title
  description
  icon
`;

const knowledgeBaseTopics = `
  query knowledgeBaseTopics($page: Int, $perPage: Int) {
    knowledgeBaseTopics(page: $page, perPage: $perPage) {
      _id
      title
      description
      brand {
        _id
        name
      }
      categories {
        ${categoryFields}
      }
      color
      backgroundImage
      languageCode
      createdBy
      createdDate
      modifiedBy
      modifiedDate

      parentCategories {
        ${categoryFields}
      }
    }
  }
`;

const knowledgeBaseCategories = `
  query objects($page: Int, $perPage: Int, $topicIds: [String]) {
    knowledgeBaseCategories(page: $page, perPage: $perPage, topicIds: $topicIds ) {
      ${categoryFields}
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      parentCategoryId
      articles {
        _id
        title
      }
    }
  }
`;

const integrationCommonFields = `
  brandId
  name
  kind
  code
  brand {
    _id
    name
    code
  }
  channels {
    _id
    name
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
    numberOfPages
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
  isActive
`;

const integrations = `
  query leadIntegrations($perPage: Int, $page: Int, $kind: String, $tag: String, $brandId: String, $status: String, $sortField: String, $sortDirection: Int) {
    integrations(perPage: $perPage, page: $page, kind: $kind, tag: $tag, brandId: $brandId, status: $status, sortField: $sortField, sortDirection: $sortDirection) {
      _id
      ${integrationCommonFields}
    }
  }
`;

export default {
  exmGet,
  knowledgeBaseTopics,
  knowledgeBaseCategories,
  integrations
};
