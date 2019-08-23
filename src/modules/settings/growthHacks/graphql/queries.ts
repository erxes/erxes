const pipelineTemplates = `
  query pipelineTemplates($type: String!) {
    pipelineTemplates(type: $type) {
      _id
      name
      description
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
