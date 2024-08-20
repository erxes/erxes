import * as dotenv from "dotenv";
import { IContext } from "../../../connectionResolver";
dotenv.config();

const productConfigQueries = {
  /**
   * ProductConfig object
   */
  async productsConfigs(_root, _args, { models }: IContext) {
    return models.ProductsConfigs.find({});
  }
};

// moduleRequireLogin(configQueries);

export default productConfigQueries;
