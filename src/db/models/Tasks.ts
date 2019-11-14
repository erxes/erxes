import { Model, model } from 'mongoose';
import { ActivityLogs } from '.';
import { fillSearchTextItem, updateOrder, watchItem } from './boardUtils';
import { IItemCommonFields as ITask, IOrderInput } from './definitions/boards';
import { ITaskDocument, taskSchema } from './definitions/tasks';

export interface ITaskModel extends Model<ITaskDocument> {
  createTask(doc: ITask): Promise<ITaskDocument>;
  getTask(_id: string): Promise<ITaskDocument>;
  updateTask(_id: string, doc: ITask): Promise<ITaskDocument>;
  updateOrder(stageId: string, orders: IOrderInput[]): Promise<ITaskDocument[]>;
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
      const tasksCount = await Tasks.find({
        stageId: doc.stageId,
      }).countDocuments();

      const task = await Tasks.create({
        ...doc,
        order: tasksCount,
        modifiedAt: new Date(),
        searchText: fillSearchTextItem(doc),
      });

      // create log
      await ActivityLogs.createTaskLog(task);

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

    /*
     * Update given Tasks orders
     */
    public static async updateOrder(stageId: string, orders: IOrderInput[]) {
      return updateOrder(Tasks, orders, stageId);
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
