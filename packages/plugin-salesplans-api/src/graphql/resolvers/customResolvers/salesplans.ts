import {
  ISalesLog,
  ISalesLogDocument
} from '../../../models/definitions/salesplans';

const SalesLog = {
  // async createdUser(salesLog, {}, { models }) {
  //   return models.Users.findOne({ _id: salesLog.createdBy });
  // },

  // async branchDetail(salesLog, {}, { models }) {
  //   return models.Branches.findOne({ _id: salesLog.branchId });
  // },

  // async departmentDetail(salesLog, {}, { models }) {
  //   return models.Departments.findOne({ _id: salesLog.departmentId });
  // },
  branchDetail(salesLog: ISalesLog) {
    console.log('whahahahshdahf');
    return {
      __typename: 'Branch',
      _id: salesLog.branchId
    };
  },
  departmentDetail(salesLog: ISalesLog) {
    return (
      salesLog.departmentId && {
        __typename: 'Department',
        _id: salesLog.departmentId
      }
    );
  },

  createdUser(salesLog: ISalesLogDocument) {
    if (!salesLog.createdBy) {
      return;
    }
    return {
      __typename: 'User',
      _id: salesLog.createdBy
    };
  }
};

export { SalesLog };
