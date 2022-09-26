import {
  ISalesLog,
  ISalesLogDocument
} from '../../../models/definitions/salesplans';

const SalesLog = {
  branchDetail(salesLog: ISalesLog) {
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
