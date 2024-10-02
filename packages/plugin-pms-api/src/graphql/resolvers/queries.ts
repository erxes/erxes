import { Pmss, Types } from "../../models";
import { IContext } from "@erxes/api-utils/src/types"

const pmsQueries = {
  pmss(
    _root,
    {
      typeId
    },
    _context: IContext
  ) {

    const selector: any = {};

    if (typeId) {
      selector.typeId = typeId;
    }

    return Pmss.find(selector).sort({ order: 1, name: 1 });
  },

  pmsTypes(_root, _args, _context: IContext) {
    return Types.find({});
  },

  pmssTotalCount(_root, _args, _context: IContext) {
    return Pmss.find({}).countDocuments();
  }
};

export default pmsQueries;
