import {
  requireLogin
} from '@erxes/api-utils/src/permissions';

import { {Name}s } from '../../models'

const {name}Queries = {
  {name}s(
    _root,
  ) {
    return {Name}s.find();
  },
};

requireLogin({name}Queries, '{name}s');

export default {name}Queries;