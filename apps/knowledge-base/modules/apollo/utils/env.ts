/*
 * The gateway address is the one thing the portal cannot look up, because it is
 * what every lookup goes through. Everything else this portal needs — its app
 * token, knowledge base topic, ticket surfaces and appearance — comes from the
 * help center config stored against the domain the request arrived on.
 */
export const readApiUrl = (): string =>
  process.env.NEXT_PUBLIC_ERXES_API_URL ?? '';
