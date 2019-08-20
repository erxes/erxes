const templates = `
  query pipelineTemplates($type: String!) {
    pipelineTemplates(type: $type) {
      _id
      name
      description
    }
  }
`;

export default {
  templates
};
