const commonParamsDef = `
  $name: String!,
`;

const commonParams = `
  name: $name,
`;

const dashboardAdd = `
	mutation dashboardAdd(${commonParamsDef}) {
		dashboardAdd(${commonParams}) {
			_id
		}
	}
`;

const dashboardEdit = `
	mutation dashboardEdit($_id: String!, ${commonParamsDef}) {
		dashboardEdit(_id: $_id, ${commonParams}) {
			_id
		}
	}
`;

const dashboardRemove = `
	mutation dashboardRemove($_id: String!) {
		dashboardRemove(_id: $_id)
	}
`;

export default {
  dashboardRemove,
  dashboardAdd,
  dashboardEdit
};
