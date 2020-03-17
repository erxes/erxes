const commonParamsDef = `
  $name: String!,
  $description: String,
  $type: String!,
  $stages: [PipelineTemplateStageInput],
`;

const commonParams = `
  name: $name,
  description: $description,
  type: $type,
  stages: $stages
`;

const pipelineTemplatesAdd = `
	mutation pipelineTemplatesAdd(${commonParamsDef}) {
		pipelineTemplatesAdd(${commonParams}) {
			_id
		}
	}
`;

const pipelineTemplatesEdit = `
	mutation pipelineTemplatesEdit($_id: String!, ${commonParamsDef}) {
		pipelineTemplatesEdit(_id: $_id, ${commonParams}) {
			_id
		}
	}
`;

const pipelineTemplatesRemove = `
	mutation pipelineTemplatesRemove($_id: String!) {
		pipelineTemplatesRemove(_id: $_id)
	}
`;

const pipelineTemplatesDuplicate = `
	mutation pipelineTemplatesDuplicate($_id: String!) {
		pipelineTemplatesDuplicate(_id: $_id) {
			_id
		}
	}
`;

export default {
  pipelineTemplatesAdd,
  pipelineTemplatesEdit,
  pipelineTemplatesRemove,
  pipelineTemplatesDuplicate
};
