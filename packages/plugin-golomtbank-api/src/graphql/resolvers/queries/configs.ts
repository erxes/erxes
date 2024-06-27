import {  paginate } from "@erxes/api-utils/src";

import { IContext } from "../../../connectionResolver";

const queries = {
  async golomtBankConfigsList(
    _root,
    { page, perPage }: { page: number; perPage: number },
    { models }: IContext
  ) {
    const totalCount = await models.GolomtBankConfigs.find({}).countDocuments();

    return {
      list: await paginate(
        models.GolomtBankConfigs.find({}).sort({ createdAt: -1 }).lean(),
        {
          page: page || 1,
          perPage: perPage || 20,
        }
      ),
      totalCount,
    };
  },

  async golomtBankConfigs(
    _root,
    { page, perPage }: { page: number; perPage: number },
    { models }: IContext
  ) {
    const response = await models.GolomtBankConfigs.find({}).sort({
      createdAt: -1,
    });

    return paginate(response, { page: page || 1, perPage: perPage || 20 });
  },

  async golomtBankConfigsDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.GolomtBankConfigs.getConfig({ _id });
  },
};
export default queries;
