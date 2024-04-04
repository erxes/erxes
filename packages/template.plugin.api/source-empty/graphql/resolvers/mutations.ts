import { {Name}s } from "../../models";
import { IContext } from "@erxes/api-utils/src/types"

const {name}Mutations = {
  /**
   * Creates a new {name}
   */
  async {name}sAdd(_root, doc, _context: IContext) {
    const {name} = await {Name}s.create{Name}(doc);

    return {name};
  }
};

export default {name}Mutations;
