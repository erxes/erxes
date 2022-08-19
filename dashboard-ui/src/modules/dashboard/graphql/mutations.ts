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

const dashboardItemEdit = `
  mutation dashboardItemEdit($_id: String!, $layout: String, $vizState: String, $name: String, $type: String) {
    dashboardItemEdit(_id: $_id, layout: $layout, vizState: $vizState, name: $name, type: $type) {
      _id
      layout
      vizState
      name
      type
    }
  }
`;

const dashboardItemAdd = `
  mutation dashboardItemAdd($dashboardId: String, $layout: String, $vizState: String, $name: String, $type: String, $isDateRange: Boolean) {
    dashboardItemAdd(dashboardId: $dashboardId, layout: $layout, vizState: $vizState, name: $name, type: $type, isDateRange: $isDateRange) {
      _id
      layout
      vizState
      name
      type
    }
  }
`;

const dashboardItemRemove = `
	mutation dashboardItemRemove($_id: String!) {
		dashboardItemRemove(_id: $_id)
	}
`;

const dashboardSendEmail = `
  mutation dashboardSendEmail($dashboardId: String!, $toEmails: [String]!, $subject: String, $content: String, $sendUrl:Boolean){
    dashboardSendEmail(dashboardId: $dashboardId, toEmails: $toEmails, subject: $subject, content: $content, sendUrl: $sendUrl)
  }
`;

export default {
  dashboardAdd,
  dashboardEdit,
  dashboardRemove,
  dashboardItemEdit,
  dashboardItemAdd,
  dashboardItemRemove,
  dashboardSendEmail
};
