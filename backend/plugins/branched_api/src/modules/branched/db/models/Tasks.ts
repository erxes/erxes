import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITask, ITaskDocument } from '../../@types';
import { taskSchema } from '../definitions/tasks';

export interface ITaskModel extends Model<ITaskDocument> {
  getTask(_id: string): Promise<ITaskDocument>;
  createTask(doc: ITask): Promise<ITaskDocument>;
  updateTask(_id: string, doc: ITask): Promise<ITaskDocument>;
  removeTasks(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadTaskClass = (models: IModels, subdomain: string) => {
  class Task {
    public static async getTask(_id: string) {
      const task = await models.Tasks.findOne({ _id });
      if (!task) throw new Error('Task not found');
      return task;
    }

    public static async createTask(doc: ITask) {
      return models.Tasks.create(doc);
    }

    public static async updateTask(_id: string, doc: ITask) {
      await models.Tasks.updateOne({ _id }, { $set: doc });
      return models.Tasks.getTask(_id);
    }

    public static async removeTasks(_ids: string[]) {
      return models.Tasks.deleteMany({ _id: { $in: _ids } });
    }
  }

  taskSchema.loadClass(Task);
  return taskSchema;
};
