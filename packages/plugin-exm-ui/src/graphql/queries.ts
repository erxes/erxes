const exms = `
  query exms($searchValue: String, $categoryId: String, $page: Int, $perPage: Int) {
    exms(searchValue: $searchValue, categoryId: $categoryId, page: $page, perPage: $perPage) {
      list {
        _id
        name
        webName
        webDescription
        description
        categoryId
        logo
        url
        favicon
        features {
          _id
          icon
          name
          description
          contentType
          contentId
          subContentId
        }
        appearance {
          primaryColor
          secondaryColor
          bodyColor
          headerColor
          footerColor
        }
        vision
        structure
      }
      totalCount
  }
}
`;

const exmDetail = `
  query exmDetail($_id: String!) {
    exmDetail(_id: $_id) {
      _id
      name
      description
      createdAt
      categoryId
      
      features {
        _id
        icon
        name
        description
        contentType
        contentId
        subContentId
      }
      
      appearance {
        primaryColor
        secondaryColor
        bodyColor
        headerColor
        footerColor
      }
      
      logo
      url
      favicon
      webName
      webDescription
    }
  }
`;

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
      
      appearance {
        primaryColor
        secondaryColor
        bodyColor
        headerColor
        footerColor
      }
      
      logo
      url
      favicon
      webName
      webDescription
    }
  }
`;

const categories = `
  query exmCoreCategories($ids:[String],$excludeIds:[String],$searchValue: String) {
    exmCoreCategories(ids:$ids,excludeIds:$excludeIds,searchValue: $searchValue) {
        _id
        code
        description
        name
        order
        isRoot,
        count
    }
  }
`;

const categoriesTotalCount = `
  query exmCoreCategoriesTotalCount {
    exmCoreCategoriesTotalCount
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
  exms,
  knowledgeBaseTopics,
  knowledgeBaseCategories,
  allBrands,
  integrations,
  categories,
  categoriesTotalCount,
  exmDetail
};
