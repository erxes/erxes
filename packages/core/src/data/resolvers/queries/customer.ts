import { Builder as BuildQuery, IListArgs } from "../../modules/coc/customers";
import {
  countByBrand,
  countByLeadStatus,
  countBySegment,
  countByTag,
  ICountBy
} from "../../modules/coc/utils";
import {
  checkPermission,
  moduleRequireLogin
} from "@erxes/api-utils/src/permissions";
import { IContext, IModels } from "../../../connectionResolver";
import { sendInboxMessage } from "../../../messageBroker";
import { TAG_TYPES } from "../../../db/models/definitions/constants";
interface ICountParams extends IListArgs {
  only: string;
  source: string;
}

const countByIntegrationType = async (
  subdomain: string,
  qb
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  const kindsMap = await sendInboxMessage({
    subdomain,
    data: {},
    action: "getIntegrationKinds",
    isRPC: true,
    defaultValue: {}
  });

  for (const type of Object.keys(kindsMap)) {
    await qb.buildAllQueries();
    await qb.integrationTypeFilter(type);

    counts[type] = await qb.runQueries("count");
  }

  return counts;
};

const countByForm = async (
  subdomain: string,
  qb: any,
  models: IModels,
  _params: any
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  const forms = await models.Forms.find({});

  for (const form of forms) {
    await qb.buildAllQueries();
    await qb.formFilter(subdomain, form._id);

    counts[form._id] = await qb.runQueries("count");
  }

  return counts;
};

const customerQueries = {
  /**
   * Customers list
   */
  async customers(
    _root,
    params: IListArgs,
    { commonQuerySelector, commonQuerySelectorElk, models, subdomain }: IContext
  ) {
    const qb = new BuildQuery(models, subdomain, params, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    await qb.buildAllQueries();

    const { list } = await qb.runQueries();

    return list;
  },

  /**
   * Customers for only main list
   */
  async customersMain(
    _root,
    params: IListArgs,
    { commonQuerySelector, commonQuerySelectorElk, models, subdomain }: IContext
  ) {
    const qb = new BuildQuery(models, subdomain, params, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    await qb.buildAllQueries();

    const { list, totalCount } = await qb.runQueries();

    return { list, totalCount };
  },

  /**
   * Group customer counts by brands, segments, integrations, tags
   */
  async customerCounts(
    _root,
    params: ICountParams,
    { commonQuerySelector, commonQuerySelectorElk, models, subdomain }: IContext
  ) {
    const { only, type, source } = params;

    const counts = {
      bySegment: {},
      byBrand: {},
      byIntegrationType: {},
      byTag: {},
      byForm: {},
      byLeadStatus: {}
    };

    const qb = new BuildQuery(models, subdomain, params, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    switch (only) {
      case "bySegment":
        counts.bySegment = await countBySegment(
          subdomain,
          `core:${type || "customer"}`,
          qb,
          source
        );
        break;

      case "byBrand":
        counts.byBrand = await countByBrand(subdomain, qb);
        break;

      case "byTag":
        counts.byTag = await countByTag(subdomain, TAG_TYPES.CUSTOMER, qb);
        break;

      case "byForm":
        counts.byForm = await countByForm(subdomain, qb, models, params);
        break;

      case "byLeadStatus":
        counts.byLeadStatus = await countByLeadStatus(qb);
        break;

      case "byIntegrationType":
        counts.byIntegrationType = await countByIntegrationType(subdomain, qb);
        break;

      default:
        break;
    }

    return counts;
  },

  /**
   * Get one customer
   */
  async customerDetail(
    _root,
    { _id }: { _id: string },
    { models: { Customers } }: IContext
  ) {
    return Customers.findOne({ $or: [{ _id }, { code: _id }] });
  },

  async contactsLogs(_root, args, { models }: IContext) {
    const { Companies, Customers } = models;
    const { action, contentType, content } = args;
    let result = {};

    const type = contentType.split(":")[1];

    if (action === "merge") {
      switch (type) {
        case "company":
          result = await Companies.find({
            _id: { $in: content }
          }).lean();
          break;
        case "customer":
          result = await Customers.find({
            _id: { $in: content }
          }).lean();
          break;
      }

      return result;
    }

    return result;
  }
};

moduleRequireLogin(customerQueries);

checkPermission(customerQueries, "customers", "showCustomers", []);
checkPermission(customerQueries, "customersMain", "showCustomers", {
  list: [],
  totalCount: 0
});

export default customerQueries;
