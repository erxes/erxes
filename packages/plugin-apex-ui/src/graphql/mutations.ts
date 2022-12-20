const commonParamsDef = `
  $_id: String,
  $name: String!,
  $code: String!,
  $content: String,
`;

const commonParams = `
  _id: $_id,
  name: $name,
  code: $code,
  content: $content,
`;

const reportsSave = `
	mutation apexReportSave(${commonParamsDef}) {
		apexReportSave(${commonParams}) {
			_id
		}
	}
`;

const reportsRemove = `
	mutation apexReportRemove($_id: String!) {
		apexReportRemove(_id: $_id)
	}
`;

export default {
  reportsSave,
  reportsRemove
};
