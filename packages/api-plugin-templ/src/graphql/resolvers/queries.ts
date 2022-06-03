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
  {name}sTotalCount(_root, _args) {
    return {Name}s.find({}).countDocuments();
  }
};

requireLogin({name}Queries, '{name}s');
requireLogin({name}Queries, '{name}sTotalCount');

export default {name}Queries;