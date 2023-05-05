import { Model } from 'mongoose';
import { IGrantRequestDocument, grantSchema } from './definitions/grant';
import { IModels } from '../connectionResolver';
import { sendCoreMessage } from '../messageBroker';
import { validateRequest } from '../common/utils';

export interface IRequestsModel extends Model<IGrantRequestDocument> {
  addGrantRequest(doc: any): Promise<IGrantRequestDocument>;
  getGrantRequest(doc: any): Promise<IGrantRequestDocument>;
  getGrantActions(): Promise<{ label: string; action: string }>;
}

export const loadRequestsClass = (models: IModels, subdomain: string) => {
  class Request {
    public static async getGrantRequest(doc: any) {
      const { cardId, cardType } = doc;

      if (!cardId || !cardType) {
        return 'You must specify a card type and a card id';
      }

      const conformity = await sendCoreMessage({
        subdomain,
        action: 'conformities.getConformities',
        data: {
          mainTypeId: cardId,
          mainType: cardType,
          relType: 'grantRequest'
        },
        isRPC: true,
        defaultValue: null
      });

      if (!conformity) {
        return 'There has no  grant request in this card';
      }

      return await models.Requests.findOne({ _id: conformity.relTypeId });
    }

    public static async addGrantRequest(doc) {
      const { cardId, cardType, userIds, action } = doc;
      try {
        await validateRequest(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      const request = await models.Requests.create({ userIds, action });

      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: cardType,
          mainTypeId: cardId,
          relType: 'grantRequest',
          relTypeId: request._id
        }
      });

      return request;
    }

    public static async getGrantActions() {
      console.log('sds');
      const actions = [{ label: 'Move Stage', action: 'moveStage' }];
      return actions;
    }
  }

  grantSchema.loadClass(Request);

  return grantSchema;
};
