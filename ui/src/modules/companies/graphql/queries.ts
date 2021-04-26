import { queries as companyQueries } from 'erxes-ui/lib/companies/graphql';

const companyFields = companyQueries.companyFields;

const listParamsDef = companyQueries.listParamsDef;

const listParamsValue = companyQueries.listParamsValue;

export const companies = companyQueries.companies;

export const companiesMain = `
  query companiesMain(${listParamsDef}) {
    companiesMain(${listParamsValue}) {
      list {
        ${companyFields}
      }

      totalCount
    }
  }
`;

export const companyCounts = `
  query companyCounts(${listParamsDef}, $only: String) {
    companyCounts(${listParamsValue}, only: $only)
  }
`;

export const companyDetail = `
  query companyDetail($_id: String!) {
    companyDetail(_id: $_id) {
      ${companyFields}
      customers {
        _id
        firstName
        middleName
        lastName
        primaryEmail
        primaryPhone
      }
    }
  }
`;

const tags = `
  query tags($type: String) {
    tags(type: $type) {
      _id
      name
      colorCode
    }
  }
`;

export const companiesListConfig = `
  query {
    fieldsDefaultColumnsConfig(contentType: "company") {
      name
      label
      order
    }
  }
`;

const companiesExport = `
  query companiesExport(${listParamsDef}) {
    companiesExport(${listParamsValue})
  }
`;

export default {
  companies,
  companiesMain,
  companyCounts,
  companyDetail,
  tags,
  companiesListConfig,
  companiesExport
};
