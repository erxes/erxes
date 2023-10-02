"use client"

import { ReactNode } from "react"
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider as Provider,
  split,
} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { getMainDefinition } from "@apollo/client/utilities"
import { createClient } from "graphql-ws"

const httpLink: any = new HttpLink({
  uri: `${process.env.NEXT_PUBLIC_MAIN_API_DOMAIN}/graphql`,
  credentials: "include",
})

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "Access-Control-Allow-Origin": (
        process.env.NEXT_PUBLIC_MAIN_API_DOMAIN || ""
      ).replace("/gateway", ""),
    },
  }
})

const wsLink: any =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: process.env.NEXT_PUBLIC_MAIN_SUBS_DOMAIN || "",
        })
      )
    : null

const httpLinkWithMiddleware = authLink.concat(httpLink)

type Definintion = {
  kind: string
  operation?: string
}
const splitLink =
  typeof window !== "undefined"
    ? split(
        ({ query }) => {
          const { kind, operation }: Definintion = getMainDefinition(query)
          return kind === "OperationDefinition" && operation === "subscription"
        },
        wsLink,
        httpLinkWithMiddleware
      )
    : httpLinkWithMiddleware

console.log(splitLink, wsLink)

export const client = new ApolloClient({
  ssrMode: typeof window !== "undefined",
  cache: new InMemoryCache(),
  link: splitLink,
})

const ApolloProvider = ({ children }: { children: ReactNode }) => (
  <Provider client={client}>{children}</Provider>
)

export default ApolloProvider
