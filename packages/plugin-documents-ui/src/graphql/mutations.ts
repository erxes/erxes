const commonParamsDef = `
  $_id: String,
  $contentType: String,
  $name: String!,
  $content: String,
  $replacer: String,
`;

const commonParams = `
  _id: $_id,
  contentType: $contentType,
  name: $name,
  content: $content,
  replacer: $replacer,
`;

const documentsSave = `
	mutation documentsSave(${commonParamsDef}) {
		documentsSave(${commonParams}) {
			_id
		}
	}
`;

const documentsRemove = `
	mutation documentsRemove($_id: String!) {
		documentsRemove(_id: $_id)
	}
`;

export default {
  documentsSave,
  documentsRemove
};
