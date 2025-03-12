import { gql } from "@apollo/client"

const integrations = gql`
  query CloudflareCallsGetIntegrations {
    cloudflareCallsGetIntegrations {
      _id
      erxesApiId
      name
    }
  }
`

export default {
  integrations,
}
