import { getConfig, paginate, sendRequest } from 'erxes-api-utils';

export const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const erkhetQueries = [
  {
    name: 'products',
    handler: async (
      _root,
      {
        type,
        categoryId,
        searchValue,
        tag,
        ids,
        excludeIds,
        pipelineId,
        boardId,
        ...pagintationArgs
      }: {
        ids: string[];
        excludeIds: boolean;
        type: string;
        categoryId: string;
        searchValue: string;
        tag: string;
        page: number;
        perPage: number;
        pipelineId: string;
        boardId: string
      },
      { models, commonQuerySelector, memoryStorage }
    ) => {
      const filter: any = commonQuerySelector;

      filter.status = { $ne: 'deleted' };

      if (type) {
        filter.type = type;
      }

      if (categoryId) {
        const category = await models.ProductCategories.getProductCatogery({
          _id: categoryId
        });
        const product_category_ids = await models.ProductCategories.find(
          { order: { $regex: new RegExp(category.order) } },
          { _id: 1 }
        );
        filter.categoryId = { $in: product_category_ids };
      }

      if (ids && ids.length > 0) {
        filter._id = { [excludeIds ? '$nin' : '$in']: ids };
      }

      if (tag) {
        filter.tagIds = { $in: [tag] };
      }

      // search =========
      if (searchValue) {
        const fields = [
          {
            name: { $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')] }
          },
          { code: { $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')] } }
        ];

        filter.$or = fields;
      }

      // return paginate(Products.find(filter).sort('code'), pagintationArgs);
      const results = await paginate(models.Products.find(filter).sort('code'), pagintationArgs);

      if (!pipelineId) {
        return results;
      }

      try {
        const configs = await getConfig(models, memoryStorage, 'ERKHET', {});
        const remConfigs = await getConfig(models, memoryStorage, 'remainderConfig', {});

        if (!Object.keys(remConfigs).includes(pipelineId)) {
          return results;
        }

        const remConfig = remConfigs[pipelineId]

        const codes = results.map(item => item.code);
        const response = await sendRequest({
          url: configs.getRemainderApiUrl,
          method: 'GET',
          params: {
            kind: 'remainder',
            api_key: configs.apiKey,
            api_secret: configs.apiSecret,
            check_relate: codes.length < 4 ? '1' : undefined,
            accounts: remConfig.account,
            locations: remConfig.location,
            inventories: codes.join(',')
          }
        })
        const jsonRes = JSON.parse(response);
        let responseByCode = jsonRes;

        if (remConfig.account && remConfig.location) {
          responseByCode = jsonRes[remConfig.account][remConfig.location]
        }

        for (const r of results) {
          r.name = r.name.concat(` (${responseByCode[r.code]})`)
        }
      } catch (e) {
        return results;
      }

      return results
    },
  }

]

export default erkhetQueries;
