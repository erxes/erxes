import {
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { {Name}s, I{Name} } from '../../models';

const {name}Mutations = {
  /**
   * Creates a new {name}
   */
  async {name}sAdd(
    _root,
    doc: I{Name},
  ) {
    const {name} = await {Name}s.create{Name}(doc);

    return {name};
  },

};

requireLogin({name}Mutations, '{name}sAdd');

export default {name}Mutations;