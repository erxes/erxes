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
      segmentIds
    }
  }
`;

export const assignmentsMain = `
  query assignmentsMain(${listParamsDef}) {
    assignmentsMain(${listParamsValue}) {
      list {
        ${commonFields}
        segmentIds
      }

      totalCount
    }
  }
`;

const assignmentDetail = `
  query assignmentDetail($_id: String!) {
    assignmentDetail(_id: $_id) {
      ${commonFields}
      segmentIds
    }
  }
`;

const segmentsDetail = `
  query segmentsDetail($_ids: [String]) {
    segmentsDetail(_ids: $_ids) {
      _id,
      name,
      color,
      count
    }
  }
`;

export default {
  assignments,
  assignmentsMain,
  assignmentDetail,
  segmentsDetail
};
