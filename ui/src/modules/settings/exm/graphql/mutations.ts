const commonParamsDef = `
  $name: String,
  $features: JSON,
`;

const commonParams = `
  name: $name,
  features: $features,
`;

const exmsAdd = `
	mutation exmsAdd($_id: String!, ${commonParamsDef}) {
		exmsAdd(_id: $_id, ${commonParams}) {
			_id
		}
	}
`;

const exmsEdit = `
	mutation exmsEdit($_id: String!, ${commonParamsDef}) {
		exmsEdit(_id: $_id, ${commonParams}) {
			_id
		}
	}
`;

export default {
  exmsAdd,
  exmsEdit
};
