const { GatewayDataSource } = require("esm")(module)(
  "federation-subscription-tools"
);

import { ApolloServer, gql } from "apollo-server-express";
import { DocumentNode, GraphQLResolveInfo } from "graphql";
import merge from "lodash/merge";

export default class MyGatewayDataSource extends GatewayDataSource {
  private apolloServer: ApolloServer<any>;

  constructor(apolloServer: ApolloServer<any>) {
    super();
    this.apolloServer = apolloServer;
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
      const response = await this.apolloServer.executeOperation({
        query,
        variables: queryVariables,
      });
      if (response.data) {
        return merge(payloadData, Object.values(response.data)[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  public async queryAndMergeMissingConversationMessageData({ payload, info }: { payload: any; info: GraphQLResolveInfo}): Promise<any> {
    const conversationMessage: any = Object.values(payload)[0];

    return this.queryAndMergeMissingData({
      payload,
      info,
      queryVariables: { _id: conversationMessage._id },
      buildQueryUsingSelections: (selections: any) => gql`
        query Subscription_GetMessage($_id: ID!) {
          conversationMessage(_id: $_id) {
            ${selections}
          }
        }
    `,
    });
  }
}
