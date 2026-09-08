import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ISeniorityRule,
  ISeniorityRuleDocument,
} from '../../@types/seniorityRule';
import { seniorityRuleSchema } from '../definitions/seniorityRule';

export type SeniorityRuleInput = Omit<
  ISeniorityRule,
  'createdAt' | 'updatedAt'
>;

export type SeniorityRuleListParams = {
  status?: string;
  searchValue?: string;
  page?: number;
  perPage?: number;
};

export interface ISeniorityRuleModel extends Model<ISeniorityRuleDocument> {
  getSeniorityRule(_id: string): Promise<ISeniorityRuleDocument>;
  getSeniorityRuleByCode(code: string): Promise<ISeniorityRuleDocument | null>;
  createSeniorityRule(doc: SeniorityRuleInput): Promise<ISeniorityRuleDocument>;
  updateSeniorityRule(
    _id: string,
    doc: Partial<SeniorityRuleInput>,
  ): Promise<ISeniorityRuleDocument | null>;
  archiveSeniorityRule(_id: string): Promise<ISeniorityRuleDocument | null>;
  removeSeniorityRule(_id: string): Promise<string>;
}

const buildSelector = ({
  status,
  searchValue,
}: SeniorityRuleListParams): FilterQuery<ISeniorityRuleDocument> => {
  const selector: FilterQuery<ISeniorityRuleDocument> = {};

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

export const seniorityRuleSelector = buildSelector;

export const loadSeniorityRuleClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class SeniorityRuleClass {
    public static async getSeniorityRule(_id: string) {
      const rule = await models.SeniorityRules.findOne({ _id }).lean();

      if (!rule) {
        throw new Error('Seniority rule not found');
      }

      return rule;
    }

    public static async getSeniorityRuleByCode(code: string) {
      return models.SeniorityRules.findOne({ code }).lean();
    }

    public static async createSeniorityRule(doc: SeniorityRuleInput) {
      const now = new Date();
      const created = await models.SeniorityRules.create({
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

    public static async updateSeniorityRule(
      _id: string,
      doc: Partial<SeniorityRuleInput>,
    ) {
      const oldRule = await models.SeniorityRules.getSeniorityRule(_id);

      await models.SeniorityRules.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } },
      );

      const updated = await models.SeniorityRules.findOne({ _id });

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: updated?.toObject(),
        prevDocument: oldRule,
      });

      return updated;
    }

    public static async archiveSeniorityRule(_id: string) {
      return models.SeniorityRules.updateSeniorityRule(_id, {
        status: 'archived',
      });
    }

    public static async removeSeniorityRule(_id: string) {
      const oldRule = await models.SeniorityRules.getSeniorityRule(_id);

      await models.SeniorityRules.deleteOne({ _id });

      sendDbEventLog({
        action: 'delete',
        docId: oldRule._id,
      });

      return 'success';
    }
  }

  seniorityRuleSchema.loadClass(SeniorityRuleClass);

  return seniorityRuleSchema;
};
