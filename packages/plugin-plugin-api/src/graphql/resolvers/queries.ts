import { IContext } from '../../connectionResolver';

const templateQueries = {
  plugins(_root, { _args }, { models }: IContext) {
    // return models.Templates.find({});
    return models.Templates.find({});
  }
};

export default templateQueries;
