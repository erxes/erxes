import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IGrade, IGradeDocument } from '../../@types/grade';
import { gradeSchema } from '../definitions/grade';

export type GradeInput = Omit<IGrade, 'createdAt' | 'updatedAt'>;

export type GradeListParams = {
  status?: string;
  searchValue?: string;
  page?: number;
  perPage?: number;
};

export interface IGradeModel extends Model<IGradeDocument> {
  getGrade(_id: string): Promise<IGradeDocument>;
  getGradeByCode(code: string): Promise<IGradeDocument | null>;
  createGrade(doc: GradeInput): Promise<IGradeDocument>;
  updateGrade(
    _id: string,
    doc: Partial<GradeInput>,
  ): Promise<IGradeDocument | null>;
  archiveGrade(_id: string): Promise<IGradeDocument | null>;
  removeGrade(_id: string): Promise<string>;
}

const buildSelector = ({
  status,
  searchValue,
}: GradeListParams): FilterQuery<IGradeDocument> => {
  const selector: FilterQuery<IGradeDocument> = {};

  if (status) {
    selector.status = status;
  }

  if (searchValue) {
    selector.$or = [
      { code: { $regex: searchValue, $options: 'i' } },
      { name: { $regex: searchValue, $options: 'i' } },
    ];
  }

  return selector;
};

export const gradeSelector = buildSelector;

export const loadGradeClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class GradeClass {
    public static async getGrade(_id: string) {
      const grade = await models.Grades.findOne({ _id }).lean();

      if (!grade) {
        throw new Error('Grade not found');
      }

      return grade;
    }

    public static async getGradeByCode(code: string) {
      return models.Grades.findOne({ code }).lean();
    }

    public static async createGrade(doc: GradeInput) {
      const now = new Date();
      const created = await models.Grades.create({
        ...doc,
        createdAt: now,
        updatedAt: now,
      });

      sendDbEventLog({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    public static async updateGrade(_id: string, doc: Partial<GradeInput>) {
      const oldGrade = await models.Grades.getGrade(_id);

      await models.Grades.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } },
      );

      const updated = await models.Grades.findOne({ _id });

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: updated?.toObject(),
        prevDocument: oldGrade,
      });

      return updated;
    }

    public static async archiveGrade(_id: string) {
      return models.Grades.updateGrade(_id, { status: 'archived' });
    }

    public static async removeGrade(_id: string) {
      const oldGrade = await models.Grades.getGrade(_id);

      await models.Grades.deleteOne({ _id });

      sendDbEventLog({
        action: 'delete',
        docId: oldGrade._id,
      });

      return 'success';
    }
  }

  gradeSchema.loadClass(GradeClass);

  return gradeSchema;
};
