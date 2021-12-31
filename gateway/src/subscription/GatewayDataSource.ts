const { GatewayDataSource } = require("esm")(module)(
  "federation-subscription-tools"
);

import { ApolloServer } from "apollo-server-express";
import { DocumentNode, GraphQLResolveInfo } from "graphql";
import merge from "lodash/merge";

export default class MyGatewayDataSource extends GatewayDataSource {
  private apolloServer: ApolloServer<any>;

  constructor(apolloServer: ApolloServer<any>) {
    super();
    this.apolloServer = apolloServer;
  }

  async queryAndMergeMissingData({
    payload,
    queryVariables,
    info,
    buildQueryUsingSelections,
  }: {
    payload: any;
    queryVariables: object;
    info: GraphQLResolveInfo;
    buildQueryUsingSelections: (selections: any) => DocumentNode;
  }) {
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
}
