const commonParamsDef = `
  $_id: String,
  $type: String!,
  $name: String!,
  $code: String!,
  $content: String,
  $companyId: String!,
`;

const commonParams = `
  _id: $_id,
  type: $type,
  name: $name,
  code: $code,
  content: $content,
  companyId: $companyId,
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
