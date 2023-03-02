import { Bichils } from '../../models';
import { IContext } from '../../connectionResolver';

const bichilQueries = {
  bichils(_root, _args, _context: IContext) {
    return Bichils.find({});
  },

  bichilTimeclockReports(_root, queryParams, { models }: IContext) {}
};

export default bichilQueries;
