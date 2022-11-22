import { {Name}s } from "../../models";
import { IContext } from "@erxes/api-utils/src/types"

const {name}Queries = {
  {name}s(
    _root,
    _args,
    _context: IContext
  ) {
    return {Name}s.find({});
  }
};

export default {name}Queries;
