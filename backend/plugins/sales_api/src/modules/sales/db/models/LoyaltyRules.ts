import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ILoyaltyRule, ILoyaltyRuleDocument } from '../../@types';
import { loyaltyRuleIssue, TLoyaltyRuleIssue } from '../../utils/loyaltyRules';
import { loyaltyRuleSchema } from '../definitions/loyaltyRules';

const ISSUE_MESSAGES: Record<TLoyaltyRuleIssue, string> = {
  'no-campaign': 'Choose a score campaign',
  'no-board': 'Choose a board',
  'no-pipeline': 'Choose a pipeline',
  'no-earn': 'Choose where points are earned',
  'earn-and-refund': 'A stage cannot both earn and give back points',
};

export interface ILoyaltyRuleModel extends Model<ILoyaltyRuleDocument> {
  saveLoyaltyRules(
    rules: ILoyaltyRule[],
    userId: string,
  ): Promise<ILoyaltyRuleDocument[]>;
}

export const loadLoyaltyRuleClass = (
  models: IModels,
  _subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class LoyaltyRule {
    /**
     * The whole configuration is saved at once, as the dialog shows it:
     * rules kept by id are updated, the rest are removed.
     */
    public static async saveLoyaltyRules(
      rules: ILoyaltyRule[],
      userId: string,
    ) {
      rules.forEach((rule, index) => {
        const issue = loyaltyRuleIssue(rule);

        if (issue) {
          throw new Error(`Rule ${index + 1}: ${ISSUE_MESSAGES[issue]}`);
        }
      });

      const keptIds = rules.flatMap(({ _id }) => (_id ? [_id] : []));
      const removed = await models.LoyaltyRules.find(
        { _id: { $nin: keptIds } },
        { _id: 1 },
      ).lean();

      await models.LoyaltyRules.deleteMany({ _id: { $nin: keptIds } });

      for (const { _id } of removed) {
        sendDbEventLog({ action: 'delete', docId: _id });
      }

      for (const { _id, ...doc } of rules) {
        const fields = {
          type: doc.type,
          scoreCampaignId: doc.scoreCampaignId,
          boardId: doc.boardId,
          pipelineId: doc.pipelineId,
          earn: doc.earn,
          refund: doc.refund,
          updatedBy: userId,
        };

        if (_id && (await models.LoyaltyRules.exists({ _id }))) {
          await models.LoyaltyRules.updateOne({ _id }, { $set: fields });
          sendDbEventLog({
            action: 'update',
            docId: _id,
            currentDocument: fields,
          });
          continue;
        }

        const created = await models.LoyaltyRules.create({
          ...fields,
          createdBy: userId,
        });
        sendDbEventLog({
          action: 'create',
          docId: created._id,
          currentDocument: created.toObject(),
        });
      }

      return models.LoyaltyRules.find({}).sort({ createdAt: 1 }).lean();
    }
  }

  loyaltyRuleSchema.loadClass(LoyaltyRule);

  return loyaltyRuleSchema;
};
