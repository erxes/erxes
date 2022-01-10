const { GatewayDataSource } = require("esm")(module)(
  "federation-subscription-tools"
);

import { ApolloServer, gql } from "apollo-server-express";
import { DocumentNode, GraphQLResolveInfo } from "graphql";
import merge from "lodash/merge";

export default class ErxesGatewayDataSource extends GatewayDataSource {
  constructor(gatewayUrl: string) {
    super(gatewayUrl);
  }

  willSendRequest(request: any) {
    if (!request.headers) {
      request.headers = {};
    }

    request.headers["apollographql-client-name"] = "Subscriptions Service";
    request.headers["apollographql-client-version"] = "0.1.0";

    if (this.context.extra.request.headers.cookie) {
      request.headers.cookie = this.context.extra.request.headers.cookie;
    }
  }

  public async queryAndMergeMissingData({
    payload,
    queryVariables,
    info,
    buildQueryUsingSelections,
  }: {
    payload: any;
    queryVariables: object;
    info: GraphQLResolveInfo;
    buildQueryUsingSelections: (selections: any) => DocumentNode;
  }): Promise<any> {
    const selections = this.buildNonPayloadSelections(payload, info);
    const payloadData = Object.values(payload)[0];

    if (!selections) {
      return payloadData;
    }

    const query = buildQueryUsingSelections(selections);

    try {
      const response = await this.query(query, {
        variables: queryVariables,
      });
      if (response.data) {
        return merge(payloadData, Object.values(response.data)[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  public async queryAndMergeMissingConversationMessageData({
    payload,
    info,
  }: {
    payload: any;
    info: GraphQLResolveInfo;
  }): Promise<any> {
    const conversationMessage: any = Object.values(payload)[0];

    return this.queryAndMergeMissingData({
      payload,
      info,
      queryVariables: { _id: conversationMessage._id },
      buildQueryUsingSelections: (selections: any) => gql`
            query Subscription_GetMessage($_id: String!) {
              conversationMessage(_id: $_id) {
                ${selections}
              }
            }
        `,
    });
  }
}
