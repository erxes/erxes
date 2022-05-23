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

  // async unitDetail(salesLog, {}, { models }) {
  //   return models.Units.findOne({ _id: salesLog.unitId });
  // },
  branchDetail(salesLog: ISalesLog) {
    console.log('whahahahshdahf');
    return {
      __typename: 'Branch',
      _id: salesLog.branchId
    };
  },
  unitDetail(salesLog: ISalesLog) {
    return salesLog.unitId && { __typename: 'Unit', _id: salesLog.unitId };
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
