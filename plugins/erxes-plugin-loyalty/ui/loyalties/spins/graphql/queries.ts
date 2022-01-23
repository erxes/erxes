import { commonFields, commonParamsDef, commonParamsValue } from '../../common/graphq';

export const spinFields = `
  ${commonFields}
  status
`;

const listParamsDef = `
  ${commonParamsDef}
`;

const listParamsValue = `
  ${commonParamsValue}
`;

export const spins = `
  query spins(${listParamsDef}) {
    spins(${listParamsValue}) {
      ${spinFields}
    }
  }
`;

export const spinsMain = `
  query spinsMain(${listParamsDef}) {
    spinsMain(${listParamsValue}) {
      list {
        ${spinFields}
      }

      totalCount
    }
  }
`;


const spinDetail = `
  query spinDetail($_id: String!) {
    spinDetail(_id: $_id) {
      ${spinFields}
    }
  }
`;

export default {
  spins,
  spinsMain,
  spinDetail,
};
