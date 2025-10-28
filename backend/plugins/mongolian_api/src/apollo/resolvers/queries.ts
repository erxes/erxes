import { ebarimtQueries } from "~/modules/ebarimt/graphql/resolvers/queries/ebarimt";
import { productGroupQueries } from "~/modules/ebarimt/graphql/resolvers/queries/productGroups";
import { productRulesQueries } from "~/modules/ebarimt/graphql/resolvers/queries/productRules";


export const queries = {
    ...ebarimtQueries,
    ...productGroupQueries,
    ...productRulesQueries
};
