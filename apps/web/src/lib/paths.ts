import {
  type FieldContentType,
  isCoreFieldType,
  type PropertyContentType,
  type ViewRecordType,
} from '@erxes/core-contract';

/*
 * Every address in core. Links, redirects and navigate() take them from here; the route files
 * declare the same addresses as nested segments. core/no-string-link bans written-out ones.
 */

const id = (value: string) => encodeURIComponent(value);

const contactSettings = '/contacts/settings';
const productSettings = '/products/settings';

export const paths = {
  home: '/',
  welcome: '/welcome',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  acceptInvitation: '/accept-invitation',
  confirmReplyTo: '/confirm-reply-to',
  /** A plugin's (or core app's) first page: `config.path` without slashes. */
  app: (path: string) => `/${path}`,
  notifications: '/notifications',
  assistant: '/assistant',
  notificationSource: (source: string) => `/notifications/${id(source)}`,
  contacts: {
    customers: '/contacts/customers',
    customer: (customerId: string) => `/contacts/customers/${id(customerId)}`,
    leads: '/contacts/leads',
    lead: (customerId: string) => `/contacts/leads/${id(customerId)}`,
    companyLeads: '/contacts/leads/companies',
    companyLead: (companyId: string) => `/contacts/leads/companies/${id(companyId)}`,
    insights: '/contacts/leads/insights',
    companies: '/contacts/companies',
    company: (companyId: string) => `/contacts/companies/${id(companyId)}`,
    settings: contactSettings,
    properties: `${contactSettings}/properties`,
    tags: `${contactSettings}/tags`,
    leadStages: `${contactSettings}/lead-stages`,
    importExport: `${contactSettings}/import-export`,
    importOrExport: (transferId: string) => `${contactSettings}/import-export/${id(transferId)}`,
  },
  products: {
    list: '/products',
    product: (productId: string) => `/products/${id(productId)}`,
    settings: productSettings,
    categories: `${productSettings}/categories`,
    properties: `${productSettings}/properties`,
  },
  automations: {
    list: '/automations',
    automation: (automationId: string) => `/automations/${id(automationId)}`,
  },
  broadcasts: {
    list: '/broadcasts',
    broadcast: (broadcastId: string) => `/broadcasts/${id(broadcastId)}`,
    suppressions: '/broadcasts/suppressions',
    templates: '/broadcasts/templates',
    template: (templateId: string) => `/broadcasts/templates/${id(templateId)}`,
  },
  reports: {
    list: '/reports',
    leads: '/reports/leads',
  },
  settings: {
    root: '/settings',
    general: '/settings/general',
    teamMembers: '/settings/team-members',
    teamMember: (userId: string) => `/settings/team-members/${id(userId)}`,
    roles: '/settings/roles',
    structure: '/settings/structure',
    exchangeRates: '/settings/exchange-rates',
    fileUpload: '/settings/file-upload',
    plugins: '/settings/plugins',
    plan: '/settings/plan',
    recycleBin: '/settings/recycle-bin',
    payments: '/settings/payments',
    integrations: '/settings/integrations',
    integration: (key: string) => `/settings/integrations/${id(key)}`,
    integrationTab: (key: string, tab: string) =>
      `/settings/integrations/${id(key)}?tab=${id(tab)}`,
    paymentIntegrations: '/settings/integrations?tab=browse&category=payments',
    aiIntegrations: '/settings/integrations?tab=browse&category=ai',
    integrationConnection: (connectionId: string) =>
      `/settings/integrations/connections/${id(connectionId)}`,
    email: '/settings/email',
    webhooks: '/settings/webhooks',
    portals: '/settings/portals',
    portalOf: (portalId: string) => `/settings/portals/${id(portalId)}`,
    auditLog: '/settings/audit-log',
    eventDelivery: '/settings/event-delivery',
    assistantCodeMode: '/settings/assistant-code-mode',
    apiReference: '/settings/api-reference',
    /** One API's reference: core's `member` or `customer`, or a plugin's name and audience. */
    apiReferenceOf: (api: string, audience?: string) =>
      `/settings/api-reference/${id(api)}${audience ? `/${id(audience)}` : ''}`,
    apiKeys: '/settings/api-keys',
    mcp: '/settings/mcp',
    portalKeys: '/settings/api-keys?tab=portal',
    apiKeyNew: '/settings/api-keys/new',
    apiKeyOf: (keyId: string) => `/settings/api-keys/${id(keyId)}`,
    profile: '/settings/profile',
    security: '/settings/security',
    notifications: '/settings/notifications',
    assistantModel: '/settings/assistant-model',
    agents: '/settings/agents',
    agentNew: '/settings/agents/new',
    agentOf: (agentId: string) => `/settings/agents/${id(agentId)}`,
    assistantAppearance: '/settings/assistant-appearance',
    /** Plugins' record types' properties: `/settings/properties/<plugin>.<type>`. */
    properties: '/settings/properties',
  },
} as const;

/** Where each kind of record's properties are set up. */
const PROPERTIES_AREA = {
  customer: paths.contacts.properties,
  company: paths.contacts.properties,
  product: paths.products.properties,
} satisfies Record<FieldContentType, string>;

/** A record type's properties: its groups and fields, adding and editing one. */
export const propertyPaths = (contentType: PropertyContentType) => {
  const area = isCoreFieldType(contentType)
    ? PROPERTIES_AREA[contentType]
    : paths.settings.properties;

  const list = `${area}/${contentType}`;

  return {
    /** The settings area that lists them: Contacts › Settings › Properties. */
    area,
    list,
    add: (groupId?: string) => (groupId ? `${list}/${id(groupId)}/add` : `${list}/add`),
    field: (groupId: string, fieldId: string) => `${list}/${id(groupId)}/${id(fieldId)}`,
  };
};

/** The list each saved view opens on. */
export const LIST_PATHS = {
  customer: paths.contacts.customers,
  company: paths.contacts.companies,
  lead: paths.contacts.leads,
  company_lead: paths.contacts.companyLeads,
  product: paths.products.list,
} satisfies Record<ViewRecordType, string>;
