const commonParamsDef = `
  $name: String,
  $description: String,
  $features: JSON,
  $logo: AttachmentInput,
`;

const commonParams = `
  name: $name,
  description: $description,
  features: $features,
  logo: $logo,
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
