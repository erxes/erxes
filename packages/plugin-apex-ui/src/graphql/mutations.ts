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

const scommonParamsDef = `
  $_id: String,
  $title: String!,
  $content: String,
  $companyId: String!,
`;

const scommonParams = `
  _id: $_id,
  title: $title,
  content: $content,
  companyId: $companyId,
`;

const storiesSave = `
	mutation apexStorySave(${scommonParamsDef}) {
		apexStorySave(${scommonParams}) {
			_id
		}
	}
`;

const storiesRemove = `
	mutation apexStoryRemove($_id: String!) {
		apexStoryRemove(_id: $_id)
	}
`;

export default {
  reportsSave,
  reportsRemove,
  storiesSave,
  storiesRemove
};
