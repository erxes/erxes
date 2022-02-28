const pipelineTemplates = `
  query pipelineTemplates($type: String!, $searchValue: String, $status: String) {
    pipelineTemplates(type: $type, searchValue: $searchValue, status: $status) {
      _id
      name
      description
      status
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
