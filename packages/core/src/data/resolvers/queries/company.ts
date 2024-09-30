import {
  checkPermission,
  requireLogin
} from "@erxes/api-utils/src/permissions";
import { Builder, IListArgs } from "../../modules/coc/companies";
import { IContext } from "../../../connectionResolver";
import { countBySegment, countByTag } from "../../modules/coc/utils";
import { TAG_TYPES } from "../../../db/models/definitions/constants";

interface ICountArgs extends IListArgs {
  only?: string;
}

const companyQueries = {
  /**
   * Companies list
   */
  async companies(
    _root,
    params: IListArgs,
    { commonQuerySelector, commonQuerySelectorElk, models, subdomain }: IContext
  ) {
    const qb = new Builder(models, subdomain, params, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    await qb.buildAllQueries();

    const { list } = await qb.runQueries();

    return list;
  },

  /**
   * Companies for only main list
   */
  async companiesMain(
    _root,
    params: IListArgs,
    { commonQuerySelector, commonQuerySelectorElk, models, subdomain }: IContext
  ) {
    const qb = new Builder(models, subdomain, params, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

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
    { commonQuerySelector, commonQuerySelectorElk, models, subdomain }: IContext
  ) {
    const counts = {
      bySegment: {},
      byTag: {},
      byBrand: {},
      byLeadStatus: {}
    };

    const { only } = args;

    const qb = new Builder(models, subdomain, args, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    switch (only) {
      case "byTag":
        counts.byTag = await countByTag(subdomain, TAG_TYPES.COMPANY, qb);
        break;

      case "bySegment":
        counts.bySegment = await countBySegment(subdomain, "core:company", qb);
        break;
    }

    return counts;
  },

  /**
   * Get one company
   */
  async companyDetail(
    _root,
    { _id }: { _id: string },
    { models: { Companies } }: IContext
  ) {
    return Companies.findOne({ $or: [{ _id }, { code: _id }] });
  }
};

requireLogin(companyQueries, "companiesMain");
requireLogin(companyQueries, "companyCounts");
requireLogin(companyQueries, "companyDetail");

checkPermission(companyQueries, "companies", "showCompanies", []);
checkPermission(companyQueries, "companiesMain", "showCompanies", {
  list: [],
  totalCount: 0
});

export default companyQueries;
