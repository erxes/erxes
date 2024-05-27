import { IContext } from '../../connectionResolver';
import {
  sendCardsMessage,
  sendCommonMessage,
  sendKbMessage,
} from '../../messageBroker';
import { generateUsersCards, queryBuilderCards } from './utils';

const generateFiltersFromArr = (obj, { field, value, values, regex }) => {
  if (regex && value) {
    Object.assign(obj, { [field]: { $regex: new RegExp(value, 'i') } });
  }

  if (value) {
    Object.assign(obj, { [field]: value });
  }

  if (values?.length > 0) {
    obj[field] = { $in: values };
    Object.assign(obj, { [field]: { $in: values } });
  }
};

const generateSKFilter = async (
  subdomain,
  { customFieldsFilter, grantFilters },
) => {
  const filter: any = {};

  if (!!customFieldsFilter?.length) {
    for (const { field, ...selector } of customFieldsFilter) {
      generateFiltersFromArr(
        filter,
        { ...selector, field: `customFieldsData.${field}` } || {},
      );
    }
  }

  if (!!grantFilters?.length) {
    const selector: any = {};

    for (const grantFilter of grantFilters) {
      generateFiltersFromArr(selector, grantFilter || {});
    }

    const grants = await sendCommonMessage({
      serviceName: 'grants',
      subdomain,
      action: 'requests.find',
      data: { ...selector },
      isRPC: true,
      defaultValue: [],
    });

    const ids = grants.map((grant) => grant.contentTypeId);

    filter._id = { $in: ids };
  }

  return filter;
};

const aputpmQueries = {
  async getCreatedUsersCards(_root, params, { subdomain }) {
    return await generateUsersCards({
      subdomain,
      params,
      fieldName: 'userId',
    });
  },
  async getAssignedUsersCards(_root, params, { subdomain }) {
    return await generateUsersCards({
      subdomain,
      params,
      fieldName: 'assignedUserIds',
    });
  },
  async getCustomFieldUsersCards(_root, params, { subdomain }) {
    return await generateUsersCards({
      subdomain,
      params,
      fieldName: 'customFieldsData.value',
    });
  },
  async myStandartKnowledges(
    _root,
    { customFieldsFilter, grantFilters, ...params },
    { subdomain },
  ) {
    const cardQuery = await queryBuilderCards({ params, subdomain });
    const filter = await generateSKFilter(subdomain, {
      customFieldsFilter,
      grantFilters,
    });

    return await sendCardsMessage({
      subdomain,
      action: 'tickets.find',
      data: {
        ...cardQuery,
        ...filter,
      },
      isRPC: true,
      defaultValue: [],
    });
  },

  async myStandartKnowledgeConnects(
    _root,
    { kbCategoryId },
    { subdomain, models }: IContext,
  ) {
    const articles = await sendKbMessage({
      subdomain,
      action: 'articles.find',
      data: {
        query: {
          categoryId: kbCategoryId,
        },
      },
      isRPC: true,
      defaultValue: [],
    });

    const articleIds = articles.map(({ _id }) => _id);

    const assets = await sendCommonMessage({
      serviceName: 'assets',
      subdomain,
      action: 'assets.find',
      data: {
        kbArticleIds: { $in: articleIds },
      },
      isRPC: true,
      defaultValue: [],
    });

    const safetyTips = await models.SafetyTips.find({ kbCategoryId });

    return { assets, safetyTips };
  },
};

export default aputpmQueries;
