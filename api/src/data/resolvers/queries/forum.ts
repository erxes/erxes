import { Forums } from '../../../db/models';

import { IContext } from '../../types';
import { paginate } from '../../utils';

const forumQueries = {
  /**
   * Forum list
   */

  forums(
    _root,
    args: { page: number; perPage: number },
    { commonQuerySelector }: IContext
  ) {
    const forums = paginate(Forums.find(commonQuerySelector), args);
    return forums.sort({ modifiedData: -1 });
  }
};

export default forumQueries;
