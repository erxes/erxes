// The name an extension has in permissions, in the UI and in its GraphQL
// root fields: `response-templates` is `responseTemplates`.
export const pluginName = (extId: string) =>
  extId.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
