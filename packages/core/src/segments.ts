import {
  fetchByQuery,
  fetchByQueryWithScroll,
  getRealIdFromElk
} from "@erxes/api-utils/src/elasticsearch";
import {
  gatherAssociatedTypes,
  getEsIndexByContentType,
  getName,
  getServiceName
} from "@erxes/api-utils/src/segments";
import { sendCommonMessage } from "./messageBroker";
import { generateModels } from "./connectionResolver";
import _ from "underscore";

const successMessage = ids => {
  return { data: ids, status: "success" };
};

const changeType = (type: string) =>
  type === "core:lead" ? "core:customer" : type;

export default {
  contentTypes: [
    {
      type: "user",
      description: "Team member",
      esIndex: "users"
    },
    {
      type: "form_submission",
      description: "Form submission",
      esIndex: "form_submissions",
      hideInSidebar: true
    },
    { type: "company", description: "Company", esIndex: "companies" },
    { type: "customer", description: "Customer", esIndex: "customers" },
    {
      type: "lead",
      description: "Lead",
      esIndex: "customers",
      notAssociated: true
    },
    { type: "product", description: "Product", esIndex: "products" }
  ],

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: "success" };
  },

  initialSelector: async () => {
    const negative = {
      term: {
        status: "deleted"
      }
    };

    return { data: { negative }, status: "success" };
  },

  associationFilter: async ({
    subdomain,
    data: { mainType, propertyType, positiveQuery, negativeQuery }
  }) => {
    const associatedTypes: string[] = await gatherAssociatedTypes(
      changeType(mainType)
    );

    let ids: string[] = [];

    if (
      associatedTypes
        .filter(type => type !== "core:form_submission")
        .includes(propertyType) ||
      propertyType === "core:lead"
    ) {
      const models = await generateModels(subdomain);

      const mainTypeIds = (
        await fetchByQueryWithScroll({
          subdomain,
          index: await getEsIndexByContentType(propertyType),
          positiveQuery,
          negativeQuery
        })
      ).map(id => getRealIdFromElk(id));

      const ids = await models.Conformities.filterConformity({
        mainType: getName(changeType(propertyType)),
        mainTypeIds,
        relType: getName(changeType(mainType))
      });

      return successMessage(ids);
    }

    if (propertyType === "core:form_submission") {
      ids = await fetchByQuery({
        subdomain,
        index: "form_submissions",
        _source: "customerId",
        positiveQuery,
        negativeQuery
      });
    } else {
      const serviceName = getServiceName(propertyType);

      if (propertyType.includes("customer", "company")) {
        return { data: [], status: "error" };
      }

      if (serviceName === "core") {
        return { data: [], status: "error" };
      }

      ids = await sendCommonMessage({
        serviceName,
        subdomain,
        action: "segments.associationFilter",
        data: {
          mainType,
          propertyType,
          positiveQuery,
          negativeQuery
        },
        defaultValue: [],
        isRPC: true
      });
    }

    ids = _.uniq(ids);

    return successMessage(ids);
  }
};
