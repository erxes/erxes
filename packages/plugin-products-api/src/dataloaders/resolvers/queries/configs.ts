
import { IContext } from '../../../connectionResolver';


const configQueries = {
  /**
   * ProductConfig object
   */
  productsConfigs(_root, _args, { models }: IContext) {
    return models.ProductsConfigs.find({});
  }
};

// moduleRequireLogin(configQueries);

export default configQueries;
