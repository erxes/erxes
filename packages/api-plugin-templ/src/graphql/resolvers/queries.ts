import {
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const templateQueries = {
  templates(
    _root,
    _args,
    { models }: IContext
  ) {
    return models.Templates.find({});
  },

  templatesTotalCount(_root, _args, { models }: IContext) {
    return models.Templates.find({}).countDocuments();
  }
};

requireLogin(templateQueries, 'templates');
requireLogin(templateQueries, 'templatesTotalCount');

export default templateQueries;