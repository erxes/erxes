import { checkPermission } from '@erxes/api-utils/src/permissions';
import { nanoid } from 'nanoid';
import * as lodash from "lodash";
import {
  IAccount,
  IAccountDocument,
} from '../../../models/definitions/account';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { ADJ_INV_STATUSES, IAdjInvDetail, IAdjustInventory } from '../../../models/definitions/adjustInventory';
import { sendCoreMessage } from '../../../messageBroker';
import { TR_SIDES } from '../../../models/definitions/constants';
import { getTomorrow } from '@erxes/api-utils/src';

const adjustInventoryMutations = {
  async adjustInventoryAdd(
    _root,
    doc: IAdjustInventory,
    { user, docModifier, models }: IContext
  ) {
    const adjusting = await models.AdjustInventories.createAdjustInventory(docModifier({ ...doc, createBy: user._id }));

    return adjusting;
  },

  async adjustInventoryCheck(_root, { _id }: { _id: string }, { models }: IContext) {
    const adjusting = await models.AdjustInventories.getAdjustInventory(_id);
    if (adjusting.status === ADJ_INV_STATUSES.PUBLISH) {
      throw new Error('this adjusting is published');
    }

    const filter = {
      branchId: adjusting.branchId,
      departmentId: adjusting.departmentId,
    };

    const preAdjusting = await models.AdjustInventories.findOne({
      ...filter,
      accountId: adjusting.accountId,
      date: { $lt: adjusting.date }
    }).sort({ date: -1 });

    const trFilters: any = {
      'details.accountId': adjusting.accountId,
      'details.productId': { $exists: true, $ne: '' },
      ...filter,
    };

    if (preAdjusting) {
      trFilters.fullDate = { $gt: preAdjusting.date, $lt: getTomorrow(adjusting.date) }
    }

    // {$addFields: {dateStr: {$dateToString: {date:'$date', format: '%Y-%m-%d'}}}},
    const aggRecords = await models.Transactions.aggregate([
      { $match: trFilters },
      { $unwind: '$details' },
      { $sort: { fullDate: 1, 'details.side': -1 } },
      {
        $group: {
          _id: '$details.productId',
          records: { $push: '$$ROOT' }
        }
      }
    ]);

    const productsIds = aggRecords.map(r => r._id);

    const safeProductIds = lodash.difference(preAdjusting?.productIds || [], productsIds);

    const newDetails: IAdjInvDetail[] = preAdjusting?.details?.filter(d => safeProductIds.includes(d.productId)) || [];

    for (const aggRec of aggRecords) {
      const productId = aggRec._id;
      const records = aggRec.records;

      const preDetail = preAdjusting?.details?.find(d => d.productId === productId);
      let remainder = preDetail?.remainder || 0;
      let error = '';
      let warning = '';

      for (const rec of records) {
        if (rec.details.side === TR_SIDES.DEBIT) {
          remainder += rec.details.count;

        } else {
          remainder -= rec.details.count;
        }

        if (remainder < 0) {
          error = `remainder is less 0: ${rec.date}, ${rec.number}`;
          break;
        }
      }

      const newDetail = {
        productId,
        remainder: 0,
        cost: 0,
        unitCost: 0,
        soonInCount: 0,
        soonOutCount: 0,

        error,
        warning,
      }

      newDetails.push(newDetail)
    }

    await models.AdjustInventories.updateOne({ _id }, {
      $set: {
        checkedDate: new Date(),
        details: newDetails,
        productIds: newDetails.map(nd => nd.productId)
      }
    });

    return models.AdjustInventories.findOne({ _id }).lean();
  },

  async adjustInventoryPublish(_root, { _id }: { _id: string }, { models }: IContext) {
    const adjusting = await models.AdjustInventories.getAdjustInventory(_id);
    if (adjusting.status === ADJ_INV_STATUSES.PUBLISH) {
      throw new Error('this adjusting is published');
    }
  },

  async adjustInventoryCancel(_root, { _id }: { _id: string }, { models }: IContext) {
    const adjusting = await models.AdjustInventories.getAdjustInventory(_id);
    if (adjusting.status === ADJ_INV_STATUSES.PUBLISH) {
      throw new Error('this adjusting is published');
    }
  },

  async adjustInventoryRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    const adjusting = await models.AdjustInventories.getAdjustInventory(_id);
    if (adjusting.status === ADJ_INV_STATUSES.PUBLISH) {
      throw new Error('this adjusting is published');
    }
  },

  async adjustInvCorrects(_root, { date }: { date: Date }, { models }: IContext) {
    const lastAdjustInvs = await models.AdjustInventories.findOne({ status: ADJ_INV_STATUSES.PUBLISH }).sort({ date: -1 }).lean();

    if (lastAdjustInvs && lastAdjustInvs.date > date) {
      throw new Error('closed period')
    }


  }
};

export default adjustInventoryMutations;
