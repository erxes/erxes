import dayjs from 'dayjs';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

/**
 * Safely evaluate a math expression string using recursive descent parsing.
 * Only supports: numbers (int/float), +, -, *, /, parentheses.
 * No eval/Function — purely structural parsing, no code execution.
 */
export const safeEvalMath = (expr: string): number => {
  const input = (expr || '').trim();
  if (!input) return 0;

  let pos = 0;

  /** look at the current character without moving forward */
  function peek() { return input[pos]; }

  /** grab the current character and step to the next one */
  function advance() { return input[pos++]; }

  /** jump past any spaces */
  function skipWhitespace() { while (pos < input.length && input[pos] === ' ') pos++; }

  /** read a number like 42, 3.14, or -5 from the input */
  function parseNumber(): number {
    skipWhitespace();
    let numStr = '';

    if (peek() === '-' || peek() === '+') numStr += advance();

    if (peek() !== '(' && peek() !== undefined && !/[\d.]/.test(peek())) {
      throw new Error(`Invalid math expression: ${input.slice(0, 50)}`);
    }

    while (pos < input.length && /[\d.]/.test(peek())) {
      numStr += advance();
    }

    if (!numStr || numStr === '-' || numStr === '+') {
      throw new Error(`Invalid math expression: ${input.slice(0, 50)}`);
    }

    const num = Number(numStr);
    if (!isFinite(num)) {
      throw new Error(`Invalid math expression: ${input.slice(0, 50)}`);
    }
    return num;
  }

  /** handle + and - (runs last because they have the lowest priority) */
  function parseAddSub(): number {
    let left = parseMulDiv();

    while (true) {
      skipWhitespace();
      const op = peek();
      if (op !== '+' && op !== '-') break;
      advance();
      const right = parseMulDiv();
      left = op === '+' ? left + right : left - right;
    }

    return left;
  }

  /** handle * and / (runs before + and - because they bind tighter) */
  function parseMulDiv(): number {
    let left = parsePrimary();

    while (true) {
      skipWhitespace();
      const op = peek();
      if (op !== '*' && op !== '/') break;
      advance();
      const right = parsePrimary();
      left = op === '*' ? left * right : left / right;
    }

    return left;
  }

  /** handle a number or a parenthesized group like (2 + 3) */
  function parsePrimary(): number {
    skipWhitespace();

    if (peek() === '(') {
      advance();
      const val = parseAddSub();
      skipWhitespace();
      if (peek() !== ')') {
        throw new Error(`Invalid math expression: ${input.slice(0, 50)}`);
      }
      advance();
      return val;
    }

    return parseNumber();
  }

  const result = parseAddSub();
  skipWhitespace();

  if (pos < input.length) {
    throw new Error(`Invalid math expression: ${input.slice(0, 50)}`);
  }

  if (!isFinite(result)) return 0;

  return result;
};

export const resolvePlaceholderValue = (target: any, attribute: string) => {
  const [propertyName, valueToCheck, valueField] = attribute.split('-');

  const parent = target[propertyName] || {};
  // Case 1: customer-customFieldsData-1  (look up in customFieldsData)
  if (valueToCheck?.includes('customFieldsData')) {
    const fieldId = attribute.split('.').pop(); // extract the field number after '.'
    const obj = (parent.customFieldsData || []).find(
      (item: any) => item.field === fieldId,
    );
    return obj?.value ?? '0';
  }

  // Case 2: paymentsData-loyalty-amount  (find in array/object by type)
  if (valueToCheck && valueField) {
    const obj = Array.isArray(parent)
      ? parent.find((item: any) => item.type === valueToCheck)
      : parent[valueToCheck] || {};
    return obj[valueField] || '0';
  }

  // Case 3: customer-loyalty (simple nested property)
  if (valueToCheck) {
    const property = parent[valueToCheck];
    return typeof property === 'object'
      ? property?.value || '0'
      : property || '0';
  }

  // Case 4: simple top-level value (e.g. {{score}})
  return target[attribute] || '0';
};

export const doScoreCampaign = async (models: IModels, data: any) => {
  const { ownerType, ownerId, actionMethod, targetId } = data;

  try {
    await models.ScoreCampaigns.checkScoreAviableSubtract(data);

    const scoreLogs =
      (await models.ScoreLogs.find({
        ownerId,
        ownerType,
        targetId,
        action: actionMethod,
      }).lean()) || [];

    if (scoreLogs.length) {
      return;
    }

    return await models.ScoreCampaigns.doCampaign(data);
  } catch (error: any) {
    throw new Error(error?.message || 'Score campaign execution failed');
  }
};

export const refundLoyaltyScore = async (
  models: IModels,
  { targetId, ownerType, ownerId, scoreCampaignIds, checkInId },
) => {
  if (!scoreCampaignIds.length) return;

  const scoreCampaigns =
    (await models.ScoreCampaigns.find({
      _id: { $in: scoreCampaignIds },
    }).lean()) || [];

  for (const scoreCampaign of scoreCampaigns) {
    const { additionalConfig } = scoreCampaign || {};

    const checkInIds =
      additionalConfig?.cardBasedRule?.flatMap(
        ({ refundStageIds }) => refundStageIds,
      ) || [];

    if (checkInIds.includes(checkInId)) {
      try {
        await models.ScoreCampaigns.refundLoyaltyScore(
          targetId,
          ownerType,
          ownerId,
        );
      } catch (error) {
        if (
          error.message ===
          'Cannot refund loyalty score cause already refunded loyalty score'
        ) {
          return;
        }
      }
    }
  }
};

export const scoreActiveUsers = async ({ models }) => {
  const currentMonthStart = dayjs().subtract(1, 'month').toDate();
  const currentMonthEnd = dayjs().toDate();

  const monthlyActiveUsersPipeline = [
    {
      $match: {
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
      },
    },
    {
      $group: {
        _id: '$ownerId',
      },
    },
    {
      $count: 'count',
    },
  ];

  const [monthlyActiveUsers] = await models.ScoreLogs.aggregate(
    monthlyActiveUsersPipeline,
  );

  const totalActiveUsersPipeline = [
    {
      $group: {
        _id: '$ownerId',
      },
    },
    {
      $count: 'count',
    },
  ];

  const [totalActiveUsers] = await models.ScoreLogs.aggregate(
    totalActiveUsersPipeline,
  );

  return {
    monthlyActiveUsers: monthlyActiveUsers?.count || 0,
    totalActiveUsers: totalActiveUsers?.count || 0,
  };
};

export const scorePoint = async ({ doc, models, filter }) => {
  const { stageId, number } = doc;

  const refundedTargetIds = await models.ScoreLogs.distinct('targetId', {
    action: 'refund',
  });

  let filterAggregate: any[] = [];

  if (stageId || number) {
    const lookup = [
      {
        $lookup: {
          from: 'deals',
          localField: 'targetId',
          foreignField: '_id',
          as: 'target',
        },
      },
      {
        $unwind: '$target',
      },
    ];

    filterAggregate.push(...lookup);
  }

  const totalPointEarned = {
    $sum: {
      $cond: {
        if: { $eq: ['$action', 'add'] },
        then: '$changeScore',
        else: 0,
      },
    },
  };

  const totalPointRedeemed = {
    $sum: {
      $cond: {
        if: { $eq: ['$action', 'subtract'] },
        then: { $abs: '$changeScore' },
        else: 0,
      },
    },
  };

  const pointPipeline = [
    ...filterAggregate,
    {
      $match: {
        ...filter,
        targetId: {
          $nin: refundedTargetIds,
          ...filter.targetId,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalPointEarned: totalPointEarned,
        totalPointRedeemed: totalPointRedeemed,
      },
    },
    {
      $project: {
        totalPointEarned: 1,
        totalPointRedeemed: 1,
        totalPointBalance: {
          $subtract: ['$totalPointEarned', '$totalPointRedeemed'],
        },
      },
    },
  ];

  const [points] = await models.ScoreLogs.aggregate(pointPipeline);

  return {
    totalPointEarned: points?.totalPointEarned || 0,
    totalPointRedeemed: points?.totalPointRedeemed || 0,
    totalPointBalance: points?.totalPointBalance || 0,
  };
};

export const scoreProducts = async ({ doc, models, filter }) => {
  const { stageId, number } = doc;

  let filterAggregate: any[] = [];

  if (stageId || number) {
    const lookup = [
      {
        $lookup: {
          from: 'deals',
          localField: 'targetId',
          foreignField: '_id',
          as: 'target',
        },
      },
      {
        $unwind: '$target',
      },
    ];

    filterAggregate.push(...lookup);
  }

  const [mostRedeemedProductCategory] = await models.ScoreLogs.aggregate([
    ...filterAggregate,
    {
      $match: {
        ...filter,
        targetId: {
          ...filter.targetId,
          $exists: true,
        },
      },
    },
    {
      $lookup: {
        from: 'deals',
        localField: 'targetId',
        foreignField: '_id',
        as: 'dealTarget',
      },
    },
    {
      $unwind: {
        path: '$dealTarget',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$dealTarget.productsData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'pos_orders',
        localField: 'targetId',
        foreignField: '_id',
        as: 'orderTarget',
      },
    },
    {
      $unwind: {
        path: '$orderTarget',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$orderTarget.items',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        productId: {
          $ifNull: [
            '$orderTarget.items.productId',
            '$dealTarget.productsData.productId',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$productId',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $lookup: {
        from: 'product_categories',
        localField: 'product.categoryId',
        foreignField: '_id',
        as: 'productCategory',
      },
    },
    { $unwind: '$productCategory' },
    {
      $group: {
        _id: '$productCategory._id',
        name: { $first: '$productCategory.name' },
        totalCount: { $sum: '$count' },
      },
    },
    {
      $sort: { totalCount: -1 },
    },
    { $limit: 1 },
  ]);

  return {
    mostRedeemedProductCategory: mostRedeemedProductCategory?.name || '',
  };
};

export const scoreStatistic = async ({ doc, models, filter }) => {
  const { monthlyActiveUsers, totalActiveUsers } = await scoreActiveUsers({
    models,
  });

  const { totalPointEarned, totalPointRedeemed, totalPointBalance } =
    await scorePoint({
      doc,
      models,
      filter,
    });

  const { mostRedeemedProductCategory } = await scoreProducts({
    doc,
    models,
    filter,
  });

  const redemptionRate = totalPointEarned
    ? (totalPointRedeemed / totalPointEarned) * 100
    : 0;

  return {
    totalPointEarned,
    totalPointRedeemed,
    totalPointBalance,
    mostRedeemedProductCategory,
    redemptionRate,
    activeLoyaltyMembers: totalActiveUsers,
    monthlyActiveUsers,
  };
};

export const handleOnCreateCampaignScoreField = async ({ doc, subdomain }) => {
  if (doc.fieldGroupId) {
    if (doc.fieldId && doc.fieldOrigin === 'exists') {
      const field = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'fields',
        action: 'findOne',
        input: {
          query: { _id: doc.fieldId },
        },
        defaultValue: null,
      });

      if (!field) {
        throw new Error('Cannot find field from database');
      }

      if (!field.isDisabled) {
        throw new Error('Somehing went wrong field is not supported');
      }
    } else {
      if (!doc?.fieldName && doc.fieldOrigin === 'new') {
        throw new Error('Please provide a field name that for score field');
      }

      const field = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'fields',
        action: 'create',
        input: {
          text: doc.fieldName,
          groupId: doc.fieldGroupId,
          type: 'input',
          validation: 'number',
          contentType: `core:${doc.ownerType}`,
          isDisabled: true,
        },
        defaultValue: null,
      });

      doc.fieldId = field._id;
    }
  }
  return doc;
};

export const handleOnUpdateCampaignScoreField = async ({
  doc,
  subdomain,
  scoreCampaign,
}) => {
  const isNewField =
    doc.fieldName && doc.fieldOrigin === 'new' && !doc?.fieldId;

  if (doc.fieldName && doc.fieldOrigin === 'new' && !doc?.fieldId) {
    const field = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'fields',
      action: 'create',
      input: {
        text: doc.fieldName,
        groupId: doc.fieldGroupId,
        type: 'input',
        validation: 'number',
        contentType: `core:${doc.ownerType}`,
        isDisabled: true,
      },
      defaultValue: null,
    });
    doc.fieldId = field._id;
  } else {
    const modifiedFieldData: any = {};

    if (doc.fieldGroupId !== scoreCampaign.fieldGroupId) {
      if (doc.fieldOrigin === 'exists') {
        throw new Error('You cannot modify the field group of the score field');
      }
      modifiedFieldData.groupId = doc.fieldGroupId;
    }

    if (
      doc.fieldName !== scoreCampaign.fieldName &&
      doc.fieldId === scoreCampaign.fieldId &&
      doc.fieldOrigin === 'new'
    ) {
      modifiedFieldData.text = doc.fieldName;
    }

    if (Object.keys(modifiedFieldData).length > 0) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'fields',
        action: 'updateOne',
        input: {
          selector: { _id: scoreCampaign.fieldId },
          modifier: { $set: modifiedFieldData },
        },
        defaultValue: null,
      });
    }
  }

  return doc;
};
