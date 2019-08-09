import { Tasks } from '../../../db/models';
import { checkPermission, moduleRequireLogin } from '../../permissions/wrappers';
import { IListParams } from './boards';
import { generateTaskCommonFilters } from './boardUtils';

const taskQueries = {
  /**
   * Tasks list
   */
  async tasks(_root, args: IListParams) {
    const filter = await generateTaskCommonFilters(args);
    const sort = { order: 1, createdAt: -1 };

    return Tasks.find(filter)
      .sort(sort)
      .skip(args.skip || 0)
      .limit(10);
  },

  /**
   * Tasks detail
   */
  taskDetail(_root, { _id }: { _id: string }) {
    return Tasks.findOne({ _id });
  },
};

moduleRequireLogin(taskQueries);

checkPermission(taskQueries, 'tasks', 'showTasks', []);

export default taskQueries;
