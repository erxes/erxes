const commonParamsDef = `
  $name: String!,
  $content: String,
`;

const commonParams = `
  name: $name,
  content: $content,
`;

const emailTemplatesAdd = `
	mutation emailTemplatesAdd(${commonParamsDef}) {
		emailTemplatesAdd(${commonParams}) {
			_id
		}
	}
`;

const emailTemplatesEdit = `
	mutation emailTemplatesEdit($_id: String!, ${commonParamsDef}) {
		emailTemplatesEdit(_id: $_id, ${commonParams}) {
			_id
		}
	}
`;

const emailTemplatesRemove = `
	mutation emailTemplatesRemove($_id: String!) {
		emailTemplatesRemove(_id: $_id)
	}
`;

const emailTemplatesChangeStatus = `
  mutation emailTemplatesChangeStatus($_id: String!, $status: String) {
    emailTemplatesChangeStatus(_id: $_id, status: $status) {
      _id
    }
  }
`;

export default {
  emailTemplatesAdd,
  emailTemplatesEdit,
  emailTemplatesRemove,
  emailTemplatesChangeStatus
};
