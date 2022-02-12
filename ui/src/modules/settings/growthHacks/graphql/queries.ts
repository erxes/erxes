const pipelineTemplates = `
  query pipelineTemplates($type: String!, $searchValue: String) {
    pipelineTemplates(type: $type, searchValue: $searchValue) {
      _id
      name
      description
      stages {
        name
        formId
      }
      isDefinedByErxes
      createdAt
    }
  }
`;

const totalCount = `
  query pipelineTemplatesTotalCount {
	  pipelineTemplatesTotalCount
  }
`;

export default {
  pipelineTemplates,
  totalCount
};
