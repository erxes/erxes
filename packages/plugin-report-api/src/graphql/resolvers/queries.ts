import { Reports } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const reportQueries = {
  reports(_root, _args, _context: IContext) {
    return Reports.find({});
  }
};

export default reportQueries;
