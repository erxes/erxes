const { GatewayDataSource } = require('esm')(module)(
  'federation-subscription-tools'
);

import { DocumentNode, GraphQLResolveInfo } from 'graphql';
import { merge } from 'lodash';
import { gql } from '@apollo/client';

export default class ApolloRouterDataSource extends GatewayDataSource {
  constructor(apolloRouterUrl: string) {
    super(apolloRouterUrl);
  }

  willSendRequest(request: any) {
    if (!request.headers) {
      request.headers = {};
    }

    request.headers['apollographql-client-name'] = 'Subscriptions Service';
    request.headers['apollographql-client-version'] = '0.1.0';

    if (this.context.extra.request.headers.cookie) {
      request.headers.cookie = this.context.extra.request.headers.cookie;
    }
  }

  public async queryAndMergeMissingData({
    payload,
    queryVariables,
    info,
    buildQueryUsingSelections
  }: {
    payload: any;
    queryVariables: object;
    info: GraphQLResolveInfo;
    buildQueryUsingSelections: (selections: any) => string;
  }): Promise<any> {
    const selections = this.buildNonPayloadSelections(payload, info);

    // TODO: use info.fieldName instead of Object.values(payload)[0]
    const payloadData = Object.values(payload)[0];

    if (!selections) {
      return payloadData;
    }

    const query = buildQueryUsingSelections(selections);
    const documentNode: DocumentNode = gql(query);

    try {
      const response = await this.query(documentNode, {
        variables: queryVariables
      });

      if (response.data) {
        return merge(payloadData, Object.values(response.data)[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
