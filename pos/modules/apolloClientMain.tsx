import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"

import { getEnv } from "@/lib/utils"

const env = getEnv()

const httpLink: any = new HttpLink({
  uri: `${env.NEXT_PUBLIC_SERVER_API_DOMAIN}/graphql`,
  credentials: "include",
})

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "Access-Control-Allow-Origin": (
        env.NEXT_PUBLIC_MAIN_API_DOMAIN || ""
      ).replace("/gateway", ""),
    },
  }
})

const httpLinkWithMiddleware = authLink.concat(httpLink)

const client = new ApolloClient({
  ssrMode: typeof window !== "undefined",
  cache: new InMemoryCache(),
  link: httpLinkWithMiddleware,
})

export default client
