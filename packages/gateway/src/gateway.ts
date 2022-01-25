import {
  ApolloGateway,
  GatewayConfig,
  RemoteGraphQLDataSource,
  GraphQLDataSourceProcessOptions,
} from "@apollo/gateway";
import { ServiceEndpointDefinition } from "@apollo/gateway/src/config";
import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import { GraphQLRequestContext, GraphQLResponse } from "apollo-server-core";
import { ValueOrPromise } from "apollo-server-types";
import splitCookiesString from "./util/splitCookiesString";
import { getService, getServices } from "./redis";

export interface IGatewayContext {
  req?: express.Request & { user?: any };
  res?: express.Response;
}

async function getConfiguredServices(): Promise<ServiceEndpointDefinition[]> {
  const serviceNames = await getServices();

  const services: ServiceEndpointDefinition[] = await Promise.all(
    serviceNames.map(async (name) => {
      const service = await getService(name);
      const def: ServiceEndpointDefinition = {
        name,
        url: `${service.address}/graphql`
      }
      return def;
    })
  );

  services.push({ name: "api", url: `${process.env.API_DOMAIN}/graphql` });

  return services;
}

class CookieHeaderPassingDataSource extends RemoteGraphQLDataSource<
  IGatewayContext
> {
  didReceiveResponse({
    response,
    context,
  }: Required<
    Pick<
      GraphQLRequestContext<IGatewayContext>,
      "request" | "response" | "context"
    >
  >): ValueOrPromise<GraphQLResponse> {
    // This means gateway is starting up and didn't recieve request from clients
    if (!context.res) {
      return response;
    }

    const setCookiesCombined = response.http?.headers.get("set-cookie");

    const setCookiesArr = splitCookiesString(setCookiesCombined);

    for (const setCookie of setCookiesArr || []) {
      context.res.append("Set-Cookie", setCookie);
    }
    return response;
  }

  willSendRequest({
    request,
    context,
  }: GraphQLDataSourceProcessOptions<IGatewayContext>): ValueOrPromise<void> {
    // This means gateway is starting up and didn't recieve request from clients
    if (!("req" in context) || !context.req) {
      return;
    }

    if (context.req.user) {
      const userJson = JSON.stringify(context.req.user);
      const userJsonBase64 = Buffer.from(userJson, "utf8").toString("base64");
      request.http?.headers.set("user", userJsonBase64);
    }

    const cookie = context.req?.headers.cookie;
    if (!cookie) {
      return;
    }

    if (typeof cookie === "string") {
      request.http?.headers.set("Cookie", cookie);
    }
  }
}

export async function createGateway(): Promise<ApolloGateway> {
  const serviceList = await getConfiguredServices();
  const gatewayConfig: GatewayConfig = {
    serviceList,
    buildService: (definition: ServiceEndpointDefinition) => {
      return new CookieHeaderPassingDataSource(definition);
    },
  };

  if (process.env.NODE_ENV === "development") {
    gatewayConfig.experimental_pollInterval = 5 * 1000;
  }

  const gateway = new ApolloGateway(gatewayConfig);

  return gateway;
}
