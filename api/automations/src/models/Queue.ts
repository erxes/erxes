import { Model, model } from 'mongoose';
import { IQueue, IQueueDocument, queueSchema } from './definitions/Queues';

export interface IQueueModel extends Model<IQueueDocument> {
  getQueue(_id: string): Promise<IQueueDocument>;
  createQueue(doc: IQueue): Promise<IQueueDocument>;
  updateQueue(_id: string, doc: IQueue): Promise<IQueueDocument>;
  removeQueue(_id: string): void;
}

export const loadClass = () => {
  class Queue {
    /*
     * Get a automation
     */
    public static async getQueue(_id: string) {
      const automation = await Queues.findOne({ _id });

      if (!automation) {
        throw new Error('Queue not found');
      }

      return automation;
    }

    /**
     * Create a automation
     */
    public static async createQueue(doc: IQueue) {
      const automation = await Queues.create({
        ...doc,
        createdAt: new Date(),
      });
      return automation;
    }

    /**
     * Update a automation
     */
    public static async updateQueue(_id: string, doc: IQueue) {
      await Queues.updateOne({ _id }, { $set: doc });

      return Queues.findOne({ _id });
    }

    /**
     * Remove a automation
     */
    public static async removeQueue(_id: string) {
      return Queues.deleteOne({ _id });
    }
  }

  queueSchema.loadClass(Queue);

  return queueSchema;
};

loadClass();

// tslint:disable-next-line
const Queues = model<IQueueDocument, IQueueModel>('queues', queueSchema);

export { Queues };
