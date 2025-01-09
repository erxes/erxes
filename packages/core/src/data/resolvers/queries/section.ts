import { IContext } from "../../../connectionResolver";

const generateFilter = async (params, commonQuerySelector) => {
  const { type } = params;

  let filter: any = {};

  if (type) {
    filter.type = type;
  }

  return filter;
};

export const sortBuilder = params => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const SectionQueries = {
  /**
   * Section list
   */

  sections: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);

    return models.Sections.find(filter).sort({ createdAt: -1 });
  }
};

export default SectionQueries;
