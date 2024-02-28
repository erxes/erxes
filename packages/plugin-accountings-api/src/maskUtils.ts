import { ICustomField } from '@erxes/api-utils/src/types';
import * as _ from 'underscore';
import { IModels } from './connectionResolver';
import { sendFormsMessage } from './messageBroker';
import { IAccount, IAccountCategory } from './models/definitions/accounts';

export const checkCodeMask = async (
  category?: IAccountCategory,
  code?: string,
) => {
  if (!category || !code) {
    return false;
  }

  if (
    !category ||
    !category.maskType ||
    !category.mask ||
    !category.mask.values
  ) {
    return true;
  }

  let maskStr = '';
  const maskList: any[] = [];

  for (const value of category.mask.values || []) {
    if (value.static) {
      maskList.push(value.static);
      continue;
    }

    if (value.type === 'char') {
      maskList.push(value.char.replace(/./g, '\\.'));
    }

    if (value.type === 'customField' && value.matches) {
      maskList.push(`(${Object.values(value.matches).join('|')})`);
    }
  }
  maskStr = `${maskList.join('')}.*`;

  const mask = new RegExp(maskStr, 'g');

  if (await mask.test(code)) {
    return true;
  }

  return false;
};

export const initCustomField = async (
  subdomain: string,
  category: IAccountCategory,
  code: string,
  accountCustomFieldsData?: ICustomField[],
  docCustomFieldsData?: ICustomField[],
) => {
  if (
    !category ||
    !category.maskType ||
    !category.mask ||
    !category.mask.values
  ) {
    if (docCustomFieldsData && docCustomFieldsData.length) {
      const docFieldsIds = docCustomFieldsData.map((d) => d.field);
      const allCustomFieldsData = docCustomFieldsData.concat(
        (accountCustomFieldsData || []).filter(
          (d) => !docFieldsIds.includes(d.field),
        ),
      );

      return await sendFormsMessage({
        subdomain,
        action: 'fields.prepareCustomFieldsData',
        data: allCustomFieldsData,
        isRPC: true,
        defaultValue: [],
      });
    }

    return accountCustomFieldsData;
  }

  let strInd = 0;
  let customFieldsData: ICustomField[] = [];

  for (const value of category.mask.values || []) {
    const len = Number(value.len);
    if (value.static || value.type === 'char') {
      strInd += len;
      continue;
    }

    if (value.type === 'customField' && value.matches) {
      const subCode = code.substring(strInd, strInd + len);

      const subCodeInd = Object.values(value.matches).indexOf(subCode);

      customFieldsData.push({
        field: value.fieldId,
        value: Object.keys(value.matches)[subCodeInd],
      });
      strInd += len;
    }
  }

  const codeFieldIds = customFieldsData.map((d) => d.field);
  customFieldsData = customFieldsData.concat(
    (docCustomFieldsData || []).filter((d) => !codeFieldIds.includes(d.field)),
  );

  const withDocFieldIds = customFieldsData.map((d) => d.field);
  customFieldsData = customFieldsData.concat(
    (accountCustomFieldsData || []).filter(
      (d) => !withDocFieldIds.includes(d.field),
    ),
  );

  return await sendFormsMessage({
    subdomain,
    action: 'fields.prepareCustomFieldsData',
    data: customFieldsData,
    isRPC: true,
    defaultValue: [],
  });
};

export const checkSameMaskConfig = async (models: IModels, doc: IAccount) => {
  const similarityGroups =
    await models.AccountingsConfigs.getConfig('similarityGroup');

  if (!similarityGroups) {
    return undefined;
  }

  if (!doc.customFieldsData) {
    return undefined;
  }

  const masks = Object.keys(similarityGroups);
  const customFieldIds = (doc.customFieldsData || []).map((cf) => cf.field);

  const result: string[] = [];

  for (const mask of masks) {
    const codeRegex = new RegExp(
      `^${mask.replace(/\./g, '\\.').replace(/\*/g, '.').replace(/_/g, '.')}.*`,
      'igu',
    );

    if (
      doc.code.match(codeRegex) &&
      (similarityGroups[mask].rules || [])
        .map((sg) => sg.fieldId)
        .filter((sgf) => (customFieldIds || []).includes(sgf)).length ===
        (similarityGroups[mask].rules || []).length
    ) {
      result.push(mask);
    }
  }

  if (result.length) {
    return result;
  }

  return undefined;
};

export const groupBySameMasksAggregator = (isCount = false) => {
  const sameArr = [
    {
      $addFields: {
        sameMasksLen: {
          $cond: {
            if: { $isArray: '$sameMasks' },
            then: { $size: '$sameMasks' },
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        sameMasks: {
          $cond: {
            if: { $gt: ['$sameMasksLen', 0] },
            then: '$sameMasks',
            else: ['$_id'],
          },
        },
      },
    },
    {
      $unwind: '$sameMasks',
    },
  ];

  if (isCount) {
    return [
      ...sameArr,
      {
        $group: {
          _id: { sameMasks: '$sameMasks' },
          account: { $first: '$code' },
        },
      },
      {
        $group: {
          _id: { code: '$account' },
        },
      },
    ];
  }

  return [
    ...sameArr,
    { $sort: { 'account.code': 1 } },
    {
      $group: {
        _id: { sameMasks: '$sameMasks' },
        count: { $sum: 1 },
        account: { $first: '$$ROOT' },
      },
    },
    { $sort: { 'account.code': 1 } },
    {
      $group: {
        _id: { code: '$account.code' },
        count: { $max: '$count' },
        account: { $first: '$account' },
      },
    },
  ];
};

export const groupByCategoryAggregator = (isCount = false) => {
  const sameArr = [
    {
      $lookup: {
        from: 'account_categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $addFields: {
        same: {
          $cond: {
            if: {
              $and: [
                { $eq: ['$category.isSimilarity', true] },
                {
                  $setIsSubset: [
                    '$category.similarities.fieldId',
                    '$customFieldsData.field',
                  ],
                },
              ],
            },
            then: '$categoryId',
            else: '$_id',
          },
        },
      },
    },
  ];

  if (isCount) {
    return [
      ...sameArr,
      {
        $group: {
          _id: { same: '$same' },
        },
      },
    ];
  }

  return [
    ...sameArr,
    {
      $group: {
        _id: { same: '$same' },
        count: { $sum: 1 },
        account: { $first: '$$ROOT' },
      },
    },
    { $sort: { 'account.code': 1 } },
  ];
};

export const aggregatePaginator = (params) => {
  const { perPage = 20, page = 1 } = params;
  return [{ $skip: perPage * (page - 1) }, { $limit: perPage }];
};

export const getSimilaritiesAccounts = async (models, filter, params) => {
  const aggregates =
    params.groupedSimilarity === 'config'
      ? groupBySameMasksAggregator()
      : groupByCategoryAggregator();
  const groupedData = await models.Accounts.aggregate([
    { $match: filter },
    ...aggregates,
    ...aggregatePaginator(params),
  ]);

  return groupedData.map((gd) => ({
    ...gd.account,
    hasSimilarity: gd.count > 1,
  }));
};

export const getSimilaritiesAccountsCount = async (models, filter, params) => {
  const aggregates =
    params.groupedSimilarity === 'config'
      ? groupBySameMasksAggregator(true)
      : groupByCategoryAggregator(true);
  const groupedData = await models.Accounts.aggregate([
    { $match: filter },
    ...aggregates,
    { $group: { _id: {}, count: { $sum: 1 } } },
  ]);

  return ((groupedData || [])[0] || {}).count || 0;
};
