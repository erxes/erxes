import { Model } from 'mongoose';
import { IRCFADocument, rcfaSchema } from './definitions/rcfa';
import { IModels } from '../connectionResolver';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendRiskAssessmentsMessage
} from '../messageBroker';

export interface IRCFAModel extends Model<IRCFADocument> {
  createAssessment(params): Model<IRCFADocument>;
}

export const loadRCFAClass = (models: IModels, subdomain: string) => {
  class RCFA {
    public static async createAssessment({
      mainType,
      mainTypeId,
      assessmentDoc,
      taskDoc
    }) {
      const rcfa = await models.RCFA.findOne({ mainType, mainTypeId });

      if (!rcfa) {
        throw new Error('Not found RCFA');
      }

      const newItem = await sendCardsMessage({
        subdomain,
        action: 'tasks.create',
        data: {
          ...taskDoc,
          createdAt: new Date()
        },
        isRPC: true,
        defaultValue: null
      });

      if (!newItem) {
        throw new Error('Error occured during creating RCFA assessment task');
      }

      await sendRiskAssessmentsMessage({
        subdomain,
        action: 'riskAssessments.create',
        data: {
          ...assessmentDoc,
          cardId: newItem._id,
          cardType: 'task'
        },
        isRPC: true,
        defaultValue: null
      });

      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: 'ticket',
          mainTypeId,
          relType: 'task',
          relTypeId: newItem._id
        },
        isRPC: true,
        defaultValue: null
      });

      return newItem;
    }
  }

  rcfaSchema.loadClass(RCFA);

  return rcfaSchema;
};
