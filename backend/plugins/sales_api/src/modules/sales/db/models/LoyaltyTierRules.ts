import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ILoyaltyTierRule, ILoyaltyTierRuleDocument } from '../../@types';
import {
  loyaltyTierRuleIssue,
  TLoyaltyTierRuleIssue,
} from '../../utils/loyaltyRules';
import { loyaltyTierRuleSchema } from '../definitions/loyaltyRules';

const ISSUE_MESSAGES: Record<TLoyaltyTierRuleIssue, string> = {
  'no-wallet': 'Choose a wallet',
  'no-bands': 'Give every band a tier',
  'no-board': 'Choose a board',
  'no-pipeline': 'Choose a pipeline',
  'no-earn': 'Choose where the tier is set',
};

export interface ILoyaltyTierRuleModel extends Model<ILoyaltyTierRuleDocument> {
  saveLoyaltyTierRules(
    rules: ILoyaltyTierRule[],
    userId: string,
  ): Promise<ILoyaltyTierRuleDocument[]>;
}

export const loadLoyaltyTierRuleClass = (
  models: IModels,
  _subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class LoyaltyTierRule {
    /**
     * The whole configuration is saved at once, as the dialog shows it:
     * rules kept by id are updated, the rest are removed.
     */
    public static async saveLoyaltyTierRules(
      rules: ILoyaltyTierRule[],
      userId: string,
    ) {
      rules.forEach((rule, index) => {
        const issue = loyaltyTierRuleIssue(rule);

        if (issue) {
          throw new Error(`Tier rule ${index + 1}: ${ISSUE_MESSAGES[issue]}`);
        }
      });

      const keptIds = rules.flatMap(({ _id }) => (_id ? [_id] : []));
      const removed = await models.LoyaltyTierRules.find(
        { _id: { $nin: keptIds } },
        { _id: 1 },
      ).lean();

      await models.LoyaltyTierRules.deleteMany({ _id: { $nin: keptIds } });

      for (const { _id } of removed) {
        sendDbEventLog({ action: 'delete', docId: _id });
      }

      for (const { _id, ...doc } of rules) {
        const fields = {
          type: doc.type,
          accountTypeId: doc.accountTypeId,
          bands: doc.bands,
          onlyUpgrade: !!doc.onlyUpgrade,
          boardId: doc.boardId,
          pipelineId: doc.pipelineId,
          earn: doc.earn,
          updatedBy: userId,
        };

        if (_id && (await models.LoyaltyTierRules.exists({ _id }))) {
          await models.LoyaltyTierRules.updateOne({ _id }, { $set: fields });
          sendDbEventLog({
            action: 'update',
            docId: _id,
            currentDocument: fields,
          });
          continue;
        }

        const created = await models.LoyaltyTierRules.create({
          ...fields,
          createdBy: userId,
        });
        sendDbEventLog({
          action: 'create',
          docId: created._id,
          currentDocument: created.toObject(),
        });
      }

      return models.LoyaltyTierRules.find({}).sort({ createdAt: 1 }).lean();
    }
  }

  loyaltyTierRuleSchema.loadClass(LoyaltyTierRule);

  return loyaltyTierRuleSchema;
};
