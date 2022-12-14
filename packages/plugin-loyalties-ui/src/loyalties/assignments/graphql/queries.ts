import {
  commonFields,
  commonParamsDef,
  commonParamsValue
} from '../../common/graphq';

const listParamsDef = `
  ${commonParamsDef}
`;

const listParamsValue = `
  ${commonParamsValue}
`;

export const assignments = `
  query assignments(${listParamsDef}) {
    assignments(${listParamsValue}) {
      ${commonFields}
    }
  }
`;

export const assignmentsMain = `
  query assignmentsMain(${listParamsDef}) {
    assignmentsMain(${listParamsValue}) {
      list {
        ${commonFields}
      }

      totalCount
    }
  }
`;

const assignmentDetail = `
  query assignmentDetail($_id: String!) {
    assignmentDetail(_id: $_id) {
      ${commonFields}
    }
  }
`;

export default {
  assignments,
  assignmentsMain,
  assignmentDetail
};
