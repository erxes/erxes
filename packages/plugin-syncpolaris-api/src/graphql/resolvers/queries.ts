import { Syncpolariss } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const syncpolarisQueries = {
  syncpolariss(_root, _args, _context: IContext) {
    return Syncpolariss.find({});
  }
};

export default syncpolarisQueries;
