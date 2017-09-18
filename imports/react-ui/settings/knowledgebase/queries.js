const getTopicDetail = `
  query getKbTopicDetail($_id: String!) {
    getKbTopicDetail(_id: $_id) {
      _id
      title
      description
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      brand {
        _id
        name
      }
      categories {
        _id
        title
      }
    }
  }
`;

const getTopicList = `
  query getKbTopicList($limit: Int) {
    getKbTopicList(limit: $limit) {
      _id
      title
      description
      brand {
        _id
        name
      }
    }
  }
`;

const getTopicCount = `
  query getKbTopicCount {
    getKbTopicCount
  }
`;

const getBrandList = `
  query brands {
    brands {
      _id
      name
    }
  }
`;

const getCategoryList = `
  query getKbCategoryList {
    getKbCategoryList {
      _id
      title
      description
    }
  }
`;

const getCategoryDetail = `
  query getKbCategoryDetail($_id: String!) {
    getKbCategoryDetail(_id: $_id) {
      _id
      title
      description
      icon
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      articles {
        _id
        title
      }
    }
  }
`;

const getCategoryCount = `
  query getKbCategoryCount {
    getKbCategoryCount
  }
`;

const getArticleDetail = `
  query getKbArticleDetail($_id: String!) {
    getKbArticleDetail(_id: $_id) {
      _id
      title
      summary
      content
      createdBy
      createdDate
      modifiedBy
      modifiedDate
    }
  }
`;

const getArticleList = `
  query getKbArticleList {
    getKbArticleList {
      _id
      title
      summary
      content
    }
  }
`;

const getArticleCount = `
  query getKbArticleCount {
    getKbArticleCount
  }
`;

export default {
  getBrandList,
  getTopicDetail,
  getTopicList,
  getTopicCount,
  getCategoryDetail,
  getCategoryList,
  getCategoryCount,
  getArticleDetail,
  getArticleList,
  getArticleCount,
};
