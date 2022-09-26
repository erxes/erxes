import { IModels } from './connectionResolver';
import { IPosOrder } from './models/definitions/pos';
import {
  sendCoreMessage,
  sendLoyaltiesMessage,
  sendPosclientMessage,
  sendProductsMessage
} from './messageBroker';

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};

export const getPureDate = (date: Date, multiplier = 1) => {
  const ndate = new Date(date);
  const diffTimeZone =
    multiplier * Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getFullDate = (date: Date) => {
  const ndate = getPureDate(date, -1);
  const year = ndate.getFullYear();
  const month = ndate.getMonth();
  const day = ndate.getDate();

  const today = new Date(year, month, day);

  return today;
};

export const getTomorrow = (date: Date) => {
  return getFullDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
};

export const getChildCategories = async (subdomain: string, categoryIds) => {
  let catIds: string[] = [];
  for (const categoryId of categoryIds) {
    const childs = await sendProductsMessage({
      subdomain,
      action: 'categories.withChilds',
      data: { _id: categoryId },
      isRPC: true,
      defaultValue: []
    });

    catIds = catIds.concat((childs || []).map(ch => ch._id) || []);
  }

  return Array.from(new Set(catIds));
};

export const getBranchesUtil = async (
  subdomain: string,
  models: IModels,
  posToken: string
) => {
  const pos = await models.Pos.findOne({ token: posToken }).lean();

  if (!pos) {
    return { error: 'not found pos' };
  }

  const allowsPos = await models.Pos.find({
    isOnline: { $ne: true },
    branchId: { $in: pos.allowBranchIds }
  }).lean();

  const healthyBranchIds = [] as any;

  for (const allowPos of allowsPos) {
    const longTask = async () =>
      await sendPosclientMessage({
        subdomain,
        action: 'health_check',
        data: { token: allowPos.token },
        pos: allowPos,
        isRPC: true
      });

    const timeout = (cb, interval) => () =>
      new Promise(resolve => setTimeout(() => cb(resolve), interval));

    const onTimeout = timeout(resolve => resolve({}), 3000);

    let response = { healthy: 'down' };
    await Promise.race([longTask, onTimeout].map(f => f())).then(
      result => (response = result as { healthy: string })
    );

    if (response && response.healthy === 'ok') {
      healthyBranchIds.push(allowPos.branchId);
      break;
    }
  }

  return await sendCoreMessage({
    subdomain,
    action: 'branches.find',
    data: { query: { _id: { $in: healthyBranchIds } } },
    isRPC: true,
    defaultValue: []
  });
};

export const confirmLoyalties = async (subdomain: string, order: IPosOrder) => {
  const confirmItems = order.items.filter(i => i.bonusCount) || [];

  if (!confirmItems.length) {
    return;
  }
  const checkInfo = {};

  for (const item of confirmItems) {
    checkInfo[item.productId] = {
      voucherId: item.bonusVoucherId,
      count: item.bonusCount
    };
  }

  try {
    await sendLoyaltiesMessage({
      subdomain,
      action: 'confirmLoyalties',
      data: {
        checkInfo
      }
    });
  } catch (e) {
    console.log(e.message);
  }
};
