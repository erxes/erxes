import * as _ from 'underscore';
import { Model } from 'mongoose';
import { getOwner } from './utils';
import { IModels } from '../connectionResolver';
import {
  IScoreLogDocument,
  scoreLogSchema,
  IScoreLog
} from './definitions/scoreLog';
import {
  sendClientPortalMessage,
  sendCommonMessage,
  sendContactsMessage,
  sendCoreMessage
} from '../messageBroker';

import { IScoreParams } from './definitions/common';
import { paginate } from '@erxes/api-utils/src';

const OWNER_TYPES = {
  customer: {
    serviceName: 'contacts',
    contentType: 'customers'
  },
  company: {
    serviceName: 'contacts',
    contentType: 'companies'
  },
  user: {
    serviceName: 'core',
    contentType: 'users'
  }
};

export interface IScoreLogModel extends Model<IScoreLogDocument> {
  getScoreLog(_id: string): Promise<IScoreLogDocument>;
  getScoreLogs(doc: IScoreParams): Promise<IScoreLogDocument>;
  changeScore(doc: IScoreLog): Promise<IScoreLogDocument>;
  changeOwnersScore(doc): Promise<IScoreLogDocument>;
}

const generateFilter = (params: IScoreParams) => {
  let filter: any = {};
  if (params.ownerType) {
    filter.ownerType = params.ownerType;
  }
  if (params.ownerId) {
    filter.ownerId = params.ownerId;
  }
  if (params.fromDate) {
    filter.createdAt = { $gte: params.fromDate };
  }
  if (params.toDate) {
    filter.createdAt = { ...filter.createdAt, $lt: params.toDate };
  }
  return filter;
};

export const loadScoreLogClass = (models: IModels, subdomain: string) => {
  class ScoreLog {
    public static async getScoreLog(_id: string) {
      const scoreLog = await models.ScoreLogs.findOne({ _id }).lean();

      if (!scoreLog) {
        throw new Error('not found scoreLog rule');
      }

      return scoreLog;
    }

    public static async getScoreLogs(doc: IScoreParams) {
      const { order, orderType } = doc;
      const filter = generateFilter(doc);
      const list = paginate(
        models.ScoreLogs.find(filter).sort({ [orderType]: order }),
        doc
      );
      const total = await models.ScoreLogs.find(filter).count();
      return { list, total };
    }

    public static async changeOwnersScore(doc: IScoreLog) {
      const {
        ownerType,
        ownerIds,
        changeScore,
        description,
        createdBy = ''
      } = doc;
      const { serviceName, contentType } = OWNER_TYPES[ownerType] || {};

      const score = Number(changeScore);
      const ownerFilter = { _id: { $in: ownerIds } };

      const owners = await sendCommonMessage({
        subdomain,
        serviceName,
        action: `${contentType}.find`,
        data:
          contentType === 'users'
            ? { query: { ...ownerFilter } }
            : { ...ownerFilter },
        isRPC: true,
        defaultValue: []
      });

      if (!owners?.length) {
        throw new Error('Not found owners');
      }

      try {
        await sendCommonMessage({
          subdomain,
          serviceName,
          action: `${contentType}.updateMany`,
          data: {
            selector: {
              _id: { $in: owners.map(owner => owner._id) }
            },
            modifier: {
              $inc: { score }
            }
          },
          isRPC: true
        });
      } catch (error) {
        throw new Error(error.message);
      }

      const commonDoc = {
        ownerType,
        changeScore: score,
        createdAt: new Date(),
        description,
        createdBy
      };

      const newDatas = owners.map(owner => ({
        ownerId: owner._id,
        ...commonDoc
      }));

      return await models.ScoreLogs.insertMany(newDatas);
    }

    public static async changeScore(doc: IScoreLog) {
      const {
        ownerType,
        ownerId,
        changeScore,
        description,
        createdBy = ''
      } = doc;

      const score = Number(changeScore);
      const owner = await getOwner(subdomain, ownerType, ownerId);

      if (!owner) {
        throw new Error(`not fount ${ownerType}`);
      }

      const oldScore = Number(owner.score) || 0;
      const newScore = oldScore + score;

      if (score < 0 && newScore < 0) {
        throw new Error(`score are not enough`);
      }

      const response = await this.updateOwnerScore({
        subdomain,
        ownerId,
        ownerType,
        newScore
      });

      if (!response || !Object.keys(response || {})?.length) {
        throw new Error('Something went wrong for give score');
      }
      return await models.ScoreLogs.create({
        ownerId,
        ownerType,
        changeScore: score,
        createdAt: new Date(),
        description,
        createdBy
      });
    }
    static async updateOwnerScore({ subdomain, ownerType, ownerId, newScore }) {
      if (ownerType === 'user') {
        return await sendCoreMessage({
          subdomain,
          action: 'users.updateOne',
          data: {
            selector: { _id: ownerId },
            modifier: { $set: { score: newScore } }
          },
          isRPC: true,
          defaultValue: null
        });
      }
      if (ownerType === 'customer') {
        return await sendContactsMessage({
          subdomain,
          action: 'customers.updateOne',
          data: {
            selector: { _id: ownerId },
            modifier: { $set: { score: newScore } }
          },
          isRPC: true,
          defaultValue: null
        });
      }
      if (ownerType === 'company') {
        return await sendContactsMessage({
          subdomain,
          action: 'companies.updateCommon',
          data: {
            selector: { _id: ownerId },
            modifier: { $set: { score: newScore } }
          },
          isRPC: true,
          defaultValue: null
        });
      }
      if (ownerType === 'cpUser') {
        const cpUser = await sendClientPortalMessage({
          subdomain,
          action: 'clientPortalUsers.findOne',
          data: {
            _id: ownerId
          },
          isRPC: true,
          defaultValue: null
        });

        if (!cpUser) {
          throw new Error('Not Found Owner');
        }
        return await sendContactsMessage({
          subdomain,
          action: 'customers.updateOne',
          data: {
            selector: { _id: cpUser.erxesCustomerId },
            modifier: { $set: { score: newScore } }
          },
          isRPC: true,
          defaultValue: null
        });
      }
    }
  }

  scoreLogSchema.loadClass(ScoreLog);

  return scoreLogSchema;
};
