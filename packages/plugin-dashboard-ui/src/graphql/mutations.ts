const commonParamsDef = `
  $name: String,
  $description: String,
  $visibility: String,
  $selectedMemberIds: [String],
`;

const commonParams = `
  name: $name,
  description: $description,
  visibility: $visibility,
  selectedMemberIds: $selectedMemberIds,
`;

const dashboardsAdd = `
	mutation dashboardsAdd(${commonParamsDef}) {
		dashboardsAdd(${commonParams}) {
			_id
		}
	}
`;

const dashboardsEdit = `
	mutation dashboardsEdit($_id: String!, ${commonParamsDef}) {
		dashboardsEdit(_id: $_id, ${commonParams}) {
			_id
		}
	}
`;

const dashboardsRemove = `
  mutation dashboardsRemove($dashboardIds: [String]) {
    dashboardsRemove(dashboardIds: $dashboardIds)
  }
`;

const dashboardItemsEdit = `
  mutation dashboardItemsEdit($_id: String!, $layout: String, $vizState: String, $name: String, $type: String) {
    dashboardItemsEdit(_id: $_id, layout: $layout, vizState: $vizState, name: $name, type: $type) {
      _id
      layout
      vizState
      name
      type
    }
  }
`;

const dashboardItemsAdd = `
  mutation dashboardItemsAdd($dashboardId: String, $layout: String, $vizState: String, $name: String, $type: String, $isDateRange: Boolean) {
    dashboardItemsAdd(dashboardId: $dashboardId, layout: $layout, vizState: $vizState, name: $name, type: $type, isDateRange: $isDateRange) {
      _id
      layout
      vizState
      name
      type
    }
  }
`;

const dashboardItemsRemove = `
	mutation dashboardItemsRemove($_id: String!) {
		dashboardItemsRemove(_id: $_id)
	}
`;

export default {
  dashboardsRemove,
  dashboardsAdd,
  dashboardsEdit,
  dashboardItemsAdd,
  dashboardItemsEdit,
  dashboardItemsRemove
};
