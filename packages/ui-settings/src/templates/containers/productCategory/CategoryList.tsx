import gql from "graphql-tag";
import * as compose from "lodash.flowright";
import { withProps } from "@erxes/ui/src/utils";
import { queries as growthQueries } from "../../../growthHacks/graphql";
import { queries as responseQueries } from "../../../responseTemplates/graphql";
import { ResponseTemplatesTotalCountQueryResponse } from "@erxes/ui-inbox/src/inbox/types";
import React from "react";
import { graphql } from "react-apollo";

import List from "../../components/productCategory/CategoryList";
import { queries } from "../../graphql";
import {
  EmailTemplateTotalCountQueryResponse,
  GrowthHacksTemplateTotalCountQueryResponse,
  ProductTemplateTotalCountQueryResponse,
} from "../../types";

type Props = { history?: any; queryParams: any };

type FinalProps = {
  productTemplateTotalCountQuery: ProductTemplateTotalCountQueryResponse;
  emailTemplateTotalCountQeury: EmailTemplateTotalCountQueryResponse;
  responseTemplatesTotalCountQeury: ResponseTemplatesTotalCountQueryResponse;
  growthHacksTemplatesTotalCountQeury: GrowthHacksTemplateTotalCountQueryResponse;
} & Props;
class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const {
      productTemplateTotalCountQuery,
      emailTemplateTotalCountQeury,
      responseTemplatesTotalCountQeury,
      growthHacksTemplatesTotalCountQeury,
    } = this.props;

    const types = {
      response_templates:
        responseTemplatesTotalCountQeury.responseTemplatesTotalCount || 0,
      email_templates:
        emailTemplateTotalCountQeury.emailTemplatesTotalCount || 0,
      growth_hacking:
        growthHacksTemplatesTotalCountQeury.pipelineTemplatesTotalCount || 0,
      template: productTemplateTotalCountQuery.productTemplateTotalCount || 0,
    };

    const updatedProps = {
      ...this.props,
      loading:
        productTemplateTotalCountQuery.loading ||
        emailTemplateTotalCountQeury.loading ||
        responseTemplatesTotalCountQeury.loading,
      types,
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ProductTemplateTotalCountQueryResponse, {}>(
      gql(queries.productTemplateTotalCount),
      {
        name: "productTemplateTotalCountQuery",
        options: () => ({
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<{}, EmailTemplateTotalCountQueryResponse, {}>(
      gql(queries.emailTemplateTotalCount),
      {
        name: "emailTemplateTotalCountQeury",
        options: () => ({
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<{}, ResponseTemplatesTotalCountQueryResponse, {}>(
      gql(responseQueries.responseTemplatesTotalCount),
      {
        name: "responseTemplatesTotalCountQeury",
        options: () => ({
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<{}, GrowthHacksTemplateTotalCountQueryResponse, {}>(
      gql(growthQueries.totalCount),
      {
        name: "growthHacksTemplatesTotalCountQeury",
        options: () => ({
          fetchPolicy: "network-only",
        }),
      }
    )
  )(ProductListContainer)
);
