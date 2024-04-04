import {
  commonFields,
  commonParamsDef,
  commonParamsValue
} from '../../common/graphq';

export const donateFields = `
  ${commonFields}
  donateScore
`;

const listParamsDef = `
  ${commonParamsDef}
`;

const listParamsValue = `
  ${commonParamsValue}
`;

export const donates = `
  query donates(${listParamsDef}) {
    donates(${listParamsValue}) {
      ${donateFields}
    }
  }
`;

export const donatesMain = `
  query donatesMain(${listParamsDef}) {
    donatesMain(${listParamsValue}) {
      list {
        ${donateFields}
      }

      totalCount
    }
  }
`;

const donateDetail = `
  query donateDetail($_id: String!) {
    donateDetail(_id: $_id) {
      ${donateFields}
    }
  }
`;

export default {
  donates,
  donatesMain,
  donateDetail
};
