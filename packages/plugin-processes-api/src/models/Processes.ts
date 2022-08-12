import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  IProcess,
  IProcessDocument,
  processSchema
} from './definitions/processes';

export interface IProcessModel extends Model<IProcessDocument> {
  getProcess(_id: string): Promise<IProcessDocument>;
  createProcess(doc: IProcess): Promise<IProcessDocument>;
  updateProcess(_id: string, doc: IProcess): Promise<IProcessDocument>;
  removeProcess(_id: string): void;
}

export const loadProcessClass = (models: IModels) => {
  class Process {
    /*
     * Get a process
     */
    public static async getProcess(_id: string) {
      const process = await models.Processes.findOne({ _id });

      if (!process) {
        throw new Error('Process not found');
      }

      return process;
    }

    /**
     * Create a process
     */
    public static async createProcess(doc: IProcess) {
      const process = await models.Processes.create({
        ...doc,
        createdAt: new Date()
      });

      return process;
    }

    /**
     * Update Process
     */
    public static async updateProcess(_id: string, doc: IProcess) {
      await models.Processes.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.Processes.getProcess(_id);

      return updated;
    }

    /**
     * Remove Process
     */
    public static async removeProcess(_id: string) {
      await models.Processes.getProcess(_id);
      return models.Processes.deleteOne({ _id });
    }
  }

  processSchema.loadClass(Process);

  return processSchema;
};
