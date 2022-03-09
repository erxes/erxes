import { TAG_TYPES } from "../../models/definitions/constants";
import { Builder, IListArgs } from "../../coc/companies";
import { countBySegment, countByTag } from "../../coc/utils";
import {
  checkPermission,
  requireLogin,
} from "@erxes/api-utils/src/permissions";
import { IContext } from "../../connectionResolver";
interface ICountArgs extends IListArgs {
  only?: string;
}

const companyQueries = {
  /**
   * Companies list
   */
  async companies(_root, params: IListArgs, context: IContext) {
    const qb = new Builder(
      params,
      context
    );

    await qb.buildAllQueries();

    const { list } = await qb.runQueries();

    return list;
  },

  /**
   * Companies for only main list
   */
  async companiesMain(_root, params: IListArgs, context: IContext) {
    const { commonQuerySelector, commonQuerySelectorElk } = context;
    const qb = new Builder(
      params,
      context
    );

    await qb.buildAllQueries();

    const { list, totalCount } = await qb.runQueries();

    return { list, totalCount };
  },

  /**
   * Group company counts by segments
   */
  async companyCounts(
    _root,
    args: ICountArgs,
    context: IContext
  ) {

    const counts = {
      bySegment: {},
      byTag: {},
      byBrand: {},
      byLeadStatus: {},
    };

    const { only } = args;

    const qb = new Builder(args, context);

    switch (only) {
      case "byTag":
        counts.byTag = await countByTag(TAG_TYPES.COMPANY, qb);
        break;

      case "bySegment":
        counts.bySegment = await countBySegment("company", qb);
        break;
    }

    return counts;
  },

  /**
   * Get one company
   */
  companyDetail(
    _root,
    { _id }: { _id: string },
    { models: { Companies } }: IContext
  ) {
    return Companies.findOne({ _id });
  },
};

requireLogin(companyQueries, "companiesMain");
requireLogin(companyQueries, "companyCounts");
requireLogin(companyQueries, "companyDetail");

checkPermission(companyQueries, "companies", "showCompanies", []);
checkPermission(companyQueries, "companiesMain", "showCompanies", {
  list: [],
  totalCount: 0,
});

export default companyQueries;
