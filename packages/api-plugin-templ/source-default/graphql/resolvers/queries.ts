import { {Name}s, Types } from "../../models";
import { IContext } from "@erxes/api-utils/src/types"

const {name}Queries = {
  {name}s(
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

    return {Name}s.find(selector).sort({ order: 1, name: 1 });
  },

  {name}Types(_root, _args, _context: IContext) {
    return Types.find({});
  },

  {name}sTotalCount(_root, _args, _context: IContext) {
    return {Name}s.find({}).countDocuments();
  }
};

export default {name}Queries;
