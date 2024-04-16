
import { IContext } from "@erxes/api-utils/src/types"
import { generateModels } from "../../connectionResolver";

const burenscoringQueries = {
  async burenscorings(
    _root,
    _context: IContext,
    subdomain
  ) {

    const selector: any = {};
    const models = await generateModels(subdomain);
    return await models.BurenScorings.find(selector).lean();
  },
  
};

export default burenscoringQueries;
