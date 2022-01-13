const configsGetEnv = `
  query configsGetEnv {
    configsGetEnv {
      USE_BRAND_RESTRICTIONS
    }
  }
`;

const configsGetEmailTemplate = `
  query configsGetEmailTemplate($name: String) {
    configsGetEmailTemplate(name: $name)
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

export default {
  configsGetEnv,
  configsGetEmailTemplate,
  knowledgeBaseTopics
};
