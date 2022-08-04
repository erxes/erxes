const commonParamsDef = `
  $name: String!,
  $description: String,
  $visibility: String,
  $selectedMemberIds: [String],
  $parentId: String
`;

const commonParams = `
  name: $name,
  description: $description,
  visibility: $visibility,
  selectedMemberIds: $selectedMemberIds,
  parentId: $parentId
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
