import { Model } from 'mongoose';
import {
  createBoardItem,
  destroyBoardItemRelations,
  fillSearchTextItem,
  watchItem
} from './utils';
import { IItemCommonFields as ITask } from './definitions/boards';
import { ACTIVITY_CONTENT_TYPES } from './definitions/constants';
import { ITaskDocument, taskSchema } from './definitions/tasks';
import { IModels } from '../connectionResolver';

export interface ITaskModel extends Model<ITaskDocument> {
  createTask(doc: ITask): Promise<ITaskDocument>;
  getTask(_id: string): Promise<ITaskDocument>;
  updateTask(_id: string, doc: ITask): Promise<ITaskDocument>;
  watchTask(_id: string, isAdd: boolean, userId: string): void;
  removeTasks(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadTaskClass = (models: IModels, subdomain: string) => {
  class Task {
    /**
     * Retreives Task
     */
    public static async getTask(_id: string) {
      const task = await models.Tasks.findOne({ _id });

      if (!task) {
        throw new Error('Task not found');
      }

      return task;
    }

    /**
     * Create a Task
     */
    public static async createTask(doc: ITask) {
      if (doc.sourceConversationIds) {
        const convertedTask = await models.Tasks.findOne({
          sourceConversationIds: { $in: doc.sourceConversationIds }
        });

        if (convertedTask) {
          throw new Error('Already converted a task');
        }
      }

      return createBoardItem(models, subdomain, doc, 'task');
    }

    /**
     * Update Task
     */
    public static async updateTask(_id: string, doc: ITask) {
      const searchText = fillSearchTextItem(doc, await models.Tasks.getTask(_id));

      await models.Tasks.updateOne({ _id }, { $set: doc, searchText });

      return models.Tasks.findOne({ _id });
    }

    /**
     * Watch task
     */
    public static async watchTask(_id: string, isAdd: boolean, userId: string) {
      return watchItem(models.Tasks, _id, isAdd, userId);
    }

    public static async removeTasks(_ids: string[]) {
      // completely remove all related things
      for (const _id of _ids) {
        await destroyBoardItemRelations(models, subdomain, _id, ACTIVITY_CONTENT_TYPES.TASK);
      }

      return models.Tasks.deleteMany({ _id: { $in: _ids } });
    }
  }

  taskSchema.loadClass(Task);

  return taskSchema;
};