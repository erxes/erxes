import {
  IAssignment,
  IAssignmentDocument,
} from '@/assignment/@types/assignment';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { assignmentSchema } from '../definitions/assignment';

export interface IAssignmentModel extends Model<IAssignmentDocument> {
  getAssignment(_id: string): Promise<IAssignmentDocument>;
  getAssignments(): Promise<IAssignmentDocument[]>;
  createAssignment(doc: IAssignment): Promise<IAssignmentDocument>;
  updateAssignment(_id: string, doc: IAssignment): Promise<IAssignmentDocument>;
  removeAssignment(AssignmentId: string[]): Promise<{ ok: number }>;
}

export const loadAssignmentClass = (models: IModels) => {
  class Assignment {
    /**
     * Retrieves spin
     */
    public static async getAssignment(_id: string) {
      const Assignment = await models.Assignment.findOne({ _id }).lean();

      if (!Assignment) {
        throw new Error('Assignment not found');
      }

      return Assignment;
    }

    /**
     * Retrieves all spins
     */
    public static async getAssignments(): Promise<IAssignmentDocument[]> {
      return models.Assignment.find().lean();
    }

    /**
     * Create a spin
     */
    public static async createAssignment(
      doc: IAssignment,
    ): Promise<IAssignmentDocument> {
      return models.Assignment.create(doc);
    }

    /*
     * Update spin
     */
    public static async updateAssignment(_id: string, doc: IAssignment) {
      return await models.Assignment.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove spin
     */
    public static async removeAssignment(AssignmentId: string[]) {
      return models.Assignment.deleteMany({ _id: { $in: AssignmentId } });
    }
  }

  assignmentSchema.loadClass(Assignment);

  return assignmentSchema;
};
