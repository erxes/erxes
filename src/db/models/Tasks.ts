import { Model, model } from 'mongoose';
import { ActivityLogs } from '.';
import { fillSearchTextItem, watchItem } from './boardUtils';
import { IItemCommonFields as ITask } from './definitions/boards';
import { BOARD_STATUSES } from './definitions/constants';
import { ITaskDocument, taskSchema } from './definitions/tasks';

export interface ITaskModel extends Model<ITaskDocument> {
  createTask(doc: ITask): Promise<ITaskDocument>;
  getTask(_id: string): Promise<ITaskDocument>;
  updateTask(_id: string, doc: ITask): Promise<ITaskDocument>;
  watchTask(_id: string, isAdd: boolean, userId: string): void;
}

export const loadTaskClass = () => {
  class Task {
    /**
     * Retreives Task
     */
    public static async getTask(_id: string) {
      const task = await Tasks.findOne({ _id });

      if (!task) {
        throw new Error('Task not found');
      }

      return task;
    }

    /**
     * Create a Task
     */
    public static async createTask(doc: ITask) {
      if (doc.sourceConversationId) {
        const convertedTask = await Tasks.findOne({ sourceConversationId: doc.sourceConversationId });

        if (convertedTask) {
          throw new Error('Already converted a task');
        }
      }

      const lastVisibleTasks = await Tasks.find(
        {
          stageId: doc.stageId,
          status: { $ne: BOARD_STATUSES.ARCHIVED },
        },
        { order: 1 },
      )
        .sort({ order: -1 })
        .limit(1);

      const task = await Tasks.create({
        ...doc,
        order: ((lastVisibleTasks && lastVisibleTasks.length > 0 ? lastVisibleTasks[0].order : 0) || 0) + 1,
        createdAt: new Date(),
        modifiedAt: new Date(),
        searchText: fillSearchTextItem(doc),
      });

      // create log
      await ActivityLogs.createBoardItemLog({ item: task, contentType: 'task' });

      return task;
    }

    /**
     * Update Task
     */
    public static async updateTask(_id: string, doc: ITask) {
      const searchText = fillSearchTextItem(doc, await Tasks.getTask(_id));

      await Tasks.updateOne({ _id }, { $set: doc, searchText });

      return Tasks.findOne({ _id });
    }

    /**
     * Watch task
     */
    public static async watchTask(_id: string, isAdd: boolean, userId: string) {
      return watchItem(Tasks, _id, isAdd, userId);
    }
  }

  taskSchema.loadClass(Task);

  return taskSchema;
};

loadTaskClass();

// tslint:disable-next-line
const Tasks = model<ITaskDocument, ITaskModel>('tasks', taskSchema);

export default Tasks;
