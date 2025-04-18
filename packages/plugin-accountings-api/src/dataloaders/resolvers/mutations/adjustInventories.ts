import { getFullDate, getTomorrow } from '@erxes/api-utils/src';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import * as lodash from "lodash";
import { nanoid } from 'nanoid';
import { IContext, IModels } from '../../../connectionResolver';
import { ADJ_INV_STATUSES, IAdjustInvDetail, IAdjustInvDetailDocument, IAdjustInventory, IAdjustInventoryDocument } from '../../../models/definitions/adjustInventory';
import { JOURNALS, TR_SIDES, TR_STATUSES } from '../../../models/definitions/constants';
import { calcInvTrs, cleanPreCalced, fixInvTrs } from '../../../utils/inventories';

const checkValidDate = async (models: IModels, adjustInventory: IAdjustInventory) => {
  const date = adjustInventory.date;

  const afterAdjInvs = await models.AdjustInventories.find({ date: { gte: date }, status: ADJ_INV_STATUSES.PUBLISH }).lean();
  if (afterAdjInvs.length) {
    throw new Error('Үүнээс хойш батлагдсан тохируулга байгаа учир энэ огноонд тохируулга үүсгэх шаардлагагүй.');
  }

  const lowBeforeAdjInvs = await models.AdjustInventories.find({ date: { $lt: date }, status: { $ne: ADJ_INV_STATUSES.PUBLISH } }).lean();
  if (lowBeforeAdjInvs.length) {
    throw new Error('Энэнээс урагш дутуу гүйцэтгэлтэй тохируулга байна. Түүнийг устгах эсвэл гүйцээж байж энэ огноонд тохируулга үүсгэнэ үү.');
  }

  const beforeAdjInv = await models.AdjustInventories.findOne({ date: { $lt: date }, status: ADJ_INV_STATUSES.PUBLISH }).sort({ date: -1 }).lean();

  let beginDate = beforeAdjInv?.date;
  if (!beginDate) {
    const firstTr = await models.Transactions.findOne({ date: { $lte: date }, 'details.productId': { $exists: true, $ne: '' }, status: { $in: TR_STATUSES.ACTIVE } }).sort({ date: 1 }).lean();
    beginDate = firstTr?.date;
  }

  if (!beginDate) {
    throw new Error('ҮҮнээс урагш гүйлгээ ч алга, тохируулга ч алга. Тиймээс тохируулах шаардлагагүй.');
  }

  return { beginDate, beforeAdjInv };
}

const recheckValidDate = async (models: IModels, adjustInventory, beginDate) => {
  if (!adjustInventory?.successDate) {
    return beginDate;
  }

  const betweenModifiedFirstTr = await models.Transactions.findOne({
    date: { $gte: beginDate, $lte: adjustInventory.successDate },
    'details.productId': { $exists: true, $ne: '' },
    $or: [
      { createdAt: { $gte: adjustInventory.checkedDate } },
      { modifiedAt: { $gte: adjustInventory.checkedDate } },
    ]
  }).sort({ date: 1 }).lean();

  if (betweenModifiedFirstTr) {
    return betweenModifiedFirstTr.date;
  }

  return adjustInventory.successDate;
}

const adjustInventoryMutations = {
  async adjustInventoryAdd(
    _root,
    doc: IAdjustInventory,
    { user, docModifier, models }: IContext
  ) {
    const { beginDate } = await checkValidDate(models, doc);

    const adjusting = await models.AdjustInventories.createAdjustInventory(docModifier({ ...doc, beginDate, createBy: user._id }));
    return adjusting;
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

  async adjustInventoryRun(_root, { adjustId }: { adjustId: string }, { models, user, subdomain }: IContext) {
    const adjustInventory = await models.AdjustInventories.getAdjustInventory(adjustId);
    const date = adjustInventory.date;
    const { beginDate, beforeAdjInv } = await checkValidDate(models, adjustInventory);

    let currentDate = await recheckValidDate(models, adjustInventory, beginDate);

    await cleanPreCalced(models, adjustInventory);

    const trFilter = {
      'details.productId': { $exists: true, $ne: '' },
      status: { $in: TR_STATUSES.ACTIVE },
    }

    if (currentDate !== beginDate) {
      await calcInvTrs(models) // энэ хооронд бичилтийн өөрлөлт орохгүй тул бөөнд нь details ээ цэнэглэх зорилготой
    }

    // өдөр бүрээр гүйлгээнүүдийг журналаар багцалж тооцож өртгийг зүгшрүүлж шаардлагатай бол гүйлгээг засч эндээсээ цэнэглэнэ
    while (currentDate < date) {
      const nextDate = getTomorrow(currentDate);

      await fixInvTrs(models, { adjustId, beginDate: currentDate, endDate: nextDate, trFilter, beforeAdjInv });

      await models.Transactions.updateOne({ _id: adjustId }, { $set: { successDate: nextDate } });
      currentDate = nextDate;
    }
  }
};

export default adjustInventoryMutations;
