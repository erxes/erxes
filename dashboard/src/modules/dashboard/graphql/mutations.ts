import gql from 'graphql-tag';

const commonParamsDef = `
  $name: String!,
`;

const commonParams = `
  name: $name,
`;

export const CREATE_DASHBOARD_ITEM = gql`
  mutation CreateDashboardItem($input: DashboardItemInput) {
    createDashboardItem(input: $input) {
      id
      layout
      vizState
      name
    }
  }
`;
export const UPDATE_DASHBOARD_ITEM = gql`
  mutation UpdateDashboardItem(
    $id: String!
    $layout: String
    $vizState: String
    $name: String
  ) {
    updateDashboardItem(
      id: $id
      layout: $layout
      vizState: $vizState
      name: $name
    ) {
      id
      layout
      vizState
      name
    }
  }
`;

export const DELETE_DASHBOARD_ITEM = gql`
  mutation DeleteDashboardItem($id: String!) {
    deleteDashboardItem(id: $id) {
      id
      layout
      vizState
      name
    }
  }
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

const dashboardItemEdit = `
  mutation dashboardItemEdit($_id: String!, $layout: String, $vizState: String, $name: String) {
    dashboardItemEdit(_id: $_id, layout: $layout, vizState: $vizState, name: $name) {
      _id
      layout
      vizState
      name
    }
  }
`;

const dashboardItemAdd = `
  mutation dashboardItemAdd($dashboardId: String, $layout: String, $vizState: String, $name: String) {
    dashboardItemAdd(dashboardId: $dashboardId, layout: $layout, vizState: $vizState, name: $name) {
      _id
      layout
      vizState
      name
    }
  }
`;

export default {
  dashboardAdd,
  dashboardEdit,
  dashboardItemEdit,
  dashboardItemAdd,
  dashboardRemove
};
