const commonParamsDef = `
  $name: String!,
  $description: String,
  $type: String,
  $stages: [PipelineTemplateStage],
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

const pipelinesCopy = `
  mutation pipelinesCopy($_id: String!, $boardId: String, $type: String) {
    pipelinesCopy(_id: $_id, boardId: $boardId, type: $type) {
      _id
      boardId
    }
  }
`;

export default {
  pipelinesCopy,
  pipelineTemplatesAdd,
  pipelineTemplatesEdit,
  pipelineTemplatesRemove
};
