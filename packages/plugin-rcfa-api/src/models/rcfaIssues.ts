import { Model } from 'mongoose';
import { IRCFAIssuesDocument, rcfaIssuessSchema } from './definitions/issues';
import { IModels } from '../connectionResolver';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { sendCardsMessage } from '../messageBroker';

export interface IRCFAQuestionModel extends Model<IRCFAIssuesDocument> {
  addIssue(doc: any, user: any): Promise<IRCFAIssuesDocument>;
  editIssue(_id: string, doc: any): Promise<IRCFAIssuesDocument>;
  removeIssue(_id: string): Promise<IRCFAIssuesDocument>;
  closeRootIssue(_id: string): Promise<IRCFAIssuesDocument>;
  createTaskRcfaRoot(params): Promise<IRCFAIssuesDocument>;
  createActionRcfaRoot(params): Promise<IRCFAIssuesDocument>;
}

export const loadRCFAIssuesClass = (models: IModels, subdomain: string) => {
  class Issues {
    public static async addIssue(doc: any, user: IUserDocument) {
      const { mainType, mainTypeId } = doc;

      const rcfa = await models.RCFA.findOne({
        mainType,
        mainTypeId
      });

      if (!rcfa) {
        const rcfaDoc = {
          mainType,
          mainTypeId,
          userId: user._id
        };
        const newDoc = await models.RCFA.create(rcfaDoc);
        doc.rcfaId = newDoc._id;
      } else {
        if (doc?.parentId) {
          const [issue]: {
            status?: string;
            countHierarchies?;
          }[] = await models.Issues.aggregate([
            { $match: { _id: doc?.parentId } },
            {
              $graphLookup: {
                from: 'rcfa_issues',
                startWith: '$parentId',
                connectFromField: 'parentId',
                connectToField: '_id',
                as: 'hierarchies'
              }
            },
            {
              $project: {
                status: 1,
                countHierarchies: { $size: '$hierarchies' }
              }
            }
          ]);
          if (issue?.countHierarchies === 5) {
            throw new Error('You cannot add issue this level of rcfa');
          }
          if (issue?.status !== 'inProgress') {
            throw new Error('You cannot add issue this level of rcfa');
          }
        }

        if (rcfa.userId !== user._id) {
          throw new Error('You cannot add issue this rcfa');
        }

        doc.rcfaId = rcfa._id;
      }

      return await models.Issues.create({ ...doc });
    }

    public static async editIssue(_id, doc) {
      return await models.Issues.updateOne({ _id }, { $set: { ...doc } });
    }

    public static async removeIssue(_id) {
      const issue = await models.Issues.findOne({ _id });

      if (!issue?.parentId) {
        await models.RCFA.deleteOne({ _id: issue?.rcfaId });
      }

      return issue?.remove();
    }

    public static async closeRootIssue(_id) {
      const issueRoot = await models.Issues.findOne({ _id });

      if (!issueRoot) {
        throw new Error('Issue root not found');
      }

      const [{ hierarchIds }] = await models.Issues.aggregate([
        { $match: { _id } },
        {
          $graphLookup: {
            from: 'rcfa_issues',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'parentId',
            as: 'hierarchies'
          }
        },
        {
          $project: {
            _id: 0,
            hierarchIds: {
              $map: {
                input: '$hierarchies',
                as: 'hierarchies',
                in: '$$hierarchies._id'
              }
            }
          }
        }
      ]);

      return await models.Issues.updateMany(
        { _id: { $in: [...hierarchIds, _id] } },
        { $set: { status: 'closed', closedAt: new Date() } }
      );
    }

    public static async createTaskRcfaRoot(params) {
      const { issueId, stageId, name } = params;
      if (!issueId || !name) {
        throw new Error('You should specify a issueID or name');
      }

      const issue = await models.Issues.findOne({ _id: issueId });
      if (!issue) {
        throw new Error('Issue Not Found');
      }

      const rcfa = await models.RCFA.findOne({ _id: issue?.rcfaId });

      const rootAction = await sendCardsMessage({
        subdomain,
        action: 'createRelatedItem',
        data: {
          stageId,
          name,
          type: 'task',
          itemId: rcfa?.mainTypeId,
          sourceType: rcfa?.mainType
        },
        isRPC: true
      });

      return await models.Issues.updateOne(
        { _id: issue?._id },
        { $addToSet: { taskIds: rootAction._id } }
      );
    }

    public static async createActionRcfaRoot(params) {
      const {
        mainType,
        mainTypeId,
        destinationType,
        destinationStageId,
        issueId,
        name
      } = params;

      if (!destinationType || !destinationStageId || !issueId) {
        throw new Error('Cannot resolve rcfa');
      }

      const rcfa = await models.RCFA.findOne({ mainType, mainTypeId });

      if (!rcfa) {
        throw new Error('Something went wrong');
      }

      const issue = await models.Issues.findOne({ _id: issueId });

      if (!issue) {
        throw new Error('Issue not found');
      }

      const payload = {
        type: destinationType,
        sourceType: mainType,
        itemId: mainTypeId,
        name: name || issue?.issue || '',
        stageId: destinationStageId
      };

      const newItem = await sendCardsMessage({
        subdomain: subdomain,
        action: 'createRelatedItem',
        data: payload,
        isRPC: true
      });

      return await models.Issues.updateOne(
        { _id: issue?._id },
        {
          $addToSet: { actionIds: newItem._id },
          $set: { isRootCause: true }
        }
      );
    }
  }

  rcfaIssuessSchema.loadClass(Issues);

  return rcfaIssuessSchema;
};
