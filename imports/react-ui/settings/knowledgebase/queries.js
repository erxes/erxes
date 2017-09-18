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
    }
  }
`;

export default {
  getTopicDetail,
  getTopicList,
  getTopicCount,
  getBrandList,
  getCategoryList,
};
