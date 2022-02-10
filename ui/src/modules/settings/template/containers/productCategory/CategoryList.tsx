import React from 'react';
import List from '../../components/productCategory/CategoryList';
import { queries } from '../../graphql';
import { queries as emailQueries } from 'modules/settings/emailTemplates/graphql';
import { queries as responseQueries } from 'modules/settings/responseTemplates/graphql';
import { queries as growthQueries } from 'modules/settings/growthHacks/graphql';
import { withProps } from 'modules/common/utils';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import {
  ProductTemplateTotalCountQueryResponse,
  EmailTemplateTotalCountQueryResponse,
  GrowthHacksTemplateTotalCountQueryResponse
} from '../../types';
import { ResponseTemplatesTotalCountQueryResponse } from 'modules/settings/responseTemplates/types';

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
      growthHacksTemplatesTotalCountQeury
    } = this.props;

    const types = {
      response_templates:
        responseTemplatesTotalCountQeury.responseTemplatesTotalCount || 0,
      email_templates:
        emailTemplateTotalCountQeury.emailTemplatesTotalCount || 0,
      growth_hacking:
        growthHacksTemplatesTotalCountQeury.pipelineTemplatesTotalCount || 0,
      template: productTemplateTotalCountQuery.productTemplateTotalCount || 0
    };

    const updatedProps = {
      ...this.props,
      loading:
        productTemplateTotalCountQuery.loading ||
        emailTemplateTotalCountQeury.loading ||
        responseTemplatesTotalCountQeury.loading,
      types
    };

    return <List {...updatedProps} />;
  }
}

// const getRefetchQueries = () => {
//   return ['productTemplateTotalCount'];
// };

// const options = () => ({
//   refetchQueries: getRefetchQueries()
// });

export default withProps<Props>(
  compose(
    graphql<Props, ProductTemplateTotalCountQueryResponse, {}>(
      gql(queries.productTemplateTotalCount),
      {
        name: 'productTemplateTotalCountQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{}, EmailTemplateTotalCountQueryResponse, {}>(
      gql(emailQueries.totalCount),
      {
        name: 'emailTemplateTotalCountQeury',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{}, ResponseTemplatesTotalCountQueryResponse, {}>(
      gql(responseQueries.responseTemplatesTotalCount),
      {
        name: 'responseTemplatesTotalCountQeury',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{}, GrowthHacksTemplateTotalCountQueryResponse, {}>(
      gql(growthQueries.totalCount),
      {
        name: 'growthHacksTemplatesTotalCountQeury',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ProductListContainer)
);
