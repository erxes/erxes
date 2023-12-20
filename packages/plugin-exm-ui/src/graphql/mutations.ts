const commonParamsDef = `
  $name: String,
  $description: String,
  $features: [ExmFeatureInput],
  $logo: AttachmentInput,
  $appearance: ExmAppearanceInput,
  $url: String
  $favicon: AttachmentInput
  $webName: String
  $webDescription: String
  $vision: String
  $structure: String
  $knowledgeBaseLabel: String
  $knowledgeBaseTopicId: String
  $ticketLabel: String
  $ticketPipelineId: String
  $ticketBoardId: String
`;

const commonParams = `
  name: $name,
  description: $description,
  features: $features,
  logo: $logo,
  appearance: $appearance,
  url: $url
  favicon: $favicon
  webName: $webName
  webDescription: $webDescription
  vision: $vision
  structure: $structure
  knowledgeBaseLabel: $knowledgeBaseLabel
  knowledgeBaseTopicId: $knowledgeBaseTopicId
  ticketLabel: $ticketLabel
  ticketPipelineId: $ticketPipelineId
  ticketBoardId: $ticketBoardId
`;

const exmsAdd = `
	mutation exmsAdd(${commonParamsDef}) {
		exmsAdd(${commonParams}) {
			_id
		}
	}
`;

const exmsEdit = `
	mutation exmsEdit($_id: String!, ${commonParamsDef} ) {
		exmsEdit(_id: $_id, ${commonParams}) {
			_id
		}
	}
`;

export default {
  exmsAdd,
  exmsEdit
};
