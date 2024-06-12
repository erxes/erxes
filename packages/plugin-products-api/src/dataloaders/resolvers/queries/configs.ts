import * as dotenv from 'dotenv';
import { IContext } from '../../../connectionResolver';
dotenv.config();

const configQueries = {
  /**
   * ProductConfig object
   */
  async productsConfigs(_root, _args, { models }: IContext) {
    return models.ProductsConfigs.find({});
  }
};

// moduleRequireLogin(configQueries);

export default configQueries;
