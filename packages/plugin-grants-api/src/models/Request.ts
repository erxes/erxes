import { Model } from 'mongoose';
import { IGrantRequestDocument, grantSchema } from './definitions/grant';
import { IModels } from '../connectionResolver';
import {
  sendCommonMessage,
  sendCoreMessage,
  sendNotificationsMessage
} from '../messageBroker';
import { validateRequest } from '../common/utils';
import { serviceDiscovery } from '../configs';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { checkConfig, doAction, doLogicAfterAction } from '../utils';

export interface IRequestsModel extends Model<IGrantRequestDocument> {
  getGrantRequest(args: any): Promise<IGrantRequestDocument>;
  grantRequestDetail(_id: string): Promise<IGrantRequestDocument>;
  getGrantActions(): Promise<{ label: string; action: string }[]>;
  addGrantRequest(
    doc: any,
    user: IUserDocument
  ): Promise<IGrantRequestDocument>;
  editGrantRequest(doc: any): Promise<IGrantRequestDocument>;
  cancelGrantRequest(
    contentTypeId: string,
    contentType: string
  ): Promise<IGrantRequestDocument>;
  resolveRequest(requestId: string): Promise<IGrantRequestDocument>;
}

export const loadRequestsClass = (models: IModels, subdomain: string) => {
  class Request {
    public static async getGrantRequest(args: any) {
      const { contentTypeId, contentType } = args;

      if (!contentTypeId || !contentType) {
        throw new Error('You must specify a content type and a content id');
      }

      return await models.Requests.findOne({ contentTypeId, contentType });
    }

    public static async grantRequestDetail(_id: string) {
      const request = await models.Requests.findOne({ _id }).lean();

      if (!request) {
        throw new Error('Cannot find request with id:' + _id);
      }

      return request;
    }

    public static async addGrantRequest(doc: any, user: IUserDocument) {
      const {
        contentTypeId,
        contentType,
        userIds,
        action,
        scope,
        params
      } = doc;

      const config = await checkConfig({
        subdomain,
        action,
        scope,
        contentType,
        contentTypeId
      });

      const extendedDoc = {
        ...doc,
        params: JSON.stringify({
          sourceType: contentType,
          ...JSON.parse(params || '{}')
        }),
        requesterId: user._id
      };

      if (config) {
        extendedDoc.params = JSON.stringify({
          type: contentType,
          itemId: contentTypeId,
          ...JSON.parse(config.params || '{}')
        });
      } else {
        try {
          await validateRequest(doc);
        } catch (e) {
          throw new Error(e.message);
        }
      }

      const request = await models.Requests.create({ ...extendedDoc });

      const link = await sendCommonMessage({
        subdomain,
        serviceName: request.scope,
        action: 'getLink',
        data: { _id: contentTypeId, type: contentType },
        isRPC: true,
        defaultValue: null
      });

      if (!!link) {
        await sendNotificationsMessage({
          subdomain,
          action: 'send',
          data: {
            createdUser: user,
            receivers: userIds,
            title: `Grant`,
            action: 'wants grant',
            content: action,
            notifType: 'plugin',
            link: link
          }
        });
        sendCoreMessage({
          subdomain: 'os',
          action: 'sendMobileNotification',
          data: {
            title: `Grant`,
            body: `${user?.details?.fullName ||
              user?.details?.shortName} wants ${action}`,
            receivers: userIds,
            data: { _id: contentTypeId, type: contentType }
          }
        });
      }

      return request;
    }

    public static async editGrantRequest(doc) {
      let {
        contentTypeId,
        contentType,
        userIds,
        scope,
        action,
        params,
        requesterId
      } = doc;
      try {
        await validateRequest(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      const request = await models.Requests.getGrantRequest({
        contentTypeId,
        contentType
      });

      if (request.action !== action) {
        const config = await checkConfig({
          subdomain,
          action,
          scope,
          contentType,
          contentTypeId
        });

        params = JSON.stringify({
          type: contentType,
          itemId: contentTypeId,
          ...JSON.parse(config?.params || '{}')
        });
      }

      return await models.Requests.updateOne(
        { _id: request._id },
        { $set: { userIds, action, params, requesterId } }
      );
    }

    public static async resolveRequest(requestId) {
      const request = await models.Requests.findOne({ _id: requestId });

      if (!request) {
        throw new Error('Something went wrong');
      }

      const declinedCount = await models.Responses.countDocuments({
        requestId: request._id,
        response: 'declined'
      });

      const requester = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: request.requesterId
        },
        isRPC: true,
        defaultValue: null
      });

      if (!declinedCount) {
        await doAction(
          subdomain,
          request.scope,
          request.action,
          request._id,
          request.params,
          requester
        );
        await models.Requests.updateOne(
          { _id: request._id },
          { status: 'approved', resolvedAt: new Date() }
        );
        await doLogicAfterAction(
          subdomain,
          request._id,
          request.params,
          requester
        );
      } else {
        await models.Requests.updateOne(
          { _id: request._id },
          { status: 'declined', resolvedAt: new Date() }
        );
        await doLogicAfterAction(
          subdomain,
          request._id,
          request.params,
          requester
        );
      }
    }

    public static async cancelGrantRequest(
      contentTypeId: string,
      contentType: string
    ) {
      const request = await models.Requests.getGrantRequest({
        contentTypeId,
        contentType
      });

      if (!request) {
        throw new Error('Cannot find request');
      }

      if (request.status !== 'waiting') {
        throw new Error(
          'Cannot cancel request because request is already gotten respond'
        );
      }

      await models.Responses.deleteMany({ requestId: request._id });

      request.remove();
      return 'canceled';
    }

    public static async getGrantActions() {
      const services = await serviceDiscovery.getServices();
      const grantActions: {
        label: string;
        action: string;
        scope: string;
        type: string;
      }[] = [
        {
          label: 'Change Stage',
          action: 'changeStage',
          scope: 'cards',
          type: 'card'
        },
        {
          label: 'Create Related Card',
          action: 'createRelatedCard',
          scope: 'cards',
          type: 'card'
        }
      ];

      for (const serviceName of services) {
        const service = await serviceDiscovery.getService(serviceName, true);
        const meta = service.config.meta || {};
        if (meta && meta.grants) {
          const actions = meta.grants?.actions || [];

          for (const { label, action, type } of actions) {
            grantActions.push({
              scope: serviceName,
              label: label,
              action,
              type
            });
          }
        }
      }

      return grantActions;
    }
  }

  grantSchema.loadClass(Request);

  return grantSchema;
};
