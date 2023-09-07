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

const allBrands = `
  query allBrands {
    allBrands {
      _id
      name
    }
  }
`;

const integrations = `
  query integrations($kind: String, $brandId: String) {
    integrations(kind: $kind, brandId: $brandId) {
      _id
      name
    }
  }
`;

export default {
  exmGet,
  knowledgeBaseTopics,
  knowledgeBaseCategories,
  allBrands,
  integrations
};
