import type { ViewRecordType } from '@erxes/core-contract';

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
  /** A plugin's (or core app's) first page: `config.path` without slashes. */
  app: (path: string) => `/${path}`,
  notifications: '/notifications',
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
  },
  automations: {
    list: '/automations',
    automation: (automationId: string) => `/automations/${id(automationId)}`,
  },
  broadcasts: {
    list: '/broadcasts',
    broadcast: (broadcastId: string) => `/broadcasts/${id(broadcastId)}`,
    suppressions: '/broadcasts/suppressions',
  },
  reports: {
    list: '/reports',
    leads: '/reports/leads',
  },
  /** Custom objects' records: `/objects/<key>`, a record at `/objects/<key>/<id>`. */
  objects: {
    root: '/objects',
    list: (objectKey: string) => `/objects/${id(objectKey)}`,
    record: (objectKey: string, recordId: string) => `/objects/${id(objectKey)}/${id(recordId)}`,
  },
  settings: {
    root: '/settings',
    general: '/settings/general',
    teamMembers: '/settings/team-members',
    teamMember: (userId: string) => `/settings/team-members/${id(userId)}`,
    roles: '/settings/roles',
    structure: '/settings/structure',
    fileUpload: '/settings/file-upload',
    plugins: '/settings/plugins',
    plan: '/settings/plan',
    recycleBin: '/settings/recycle-bin',
    payments: '/settings/payments',
    integrations: '/settings/integrations',
    integration: (key: string) => `/settings/integrations/${id(key)}`,
    email: '/settings/email',
    emailSenders: '/settings/email?tab=senders',
    webhooks: '/settings/webhooks',
    auditLog: '/settings/audit-log',
    eventDelivery: '/settings/event-delivery',
    assistantCodeMode: '/settings/assistant-code-mode',
    apiReference: '/settings/api-reference',
    /** One API's reference: core's `member` or `customer`, or a plugin's name and audience. */
    apiReferenceOf: (api: string, audience?: string) =>
      `/settings/api-reference/${id(api)}${audience ? `/${id(audience)}` : ''}`,
    apiKeys: '/settings/api-keys',
    apiKeyNew: '/settings/api-keys/new',
    apiKeyOf: (keyId: string) => `/settings/api-keys/${id(keyId)}`,
    profile: '/settings/profile',
    security: '/settings/security',
    notifications: '/settings/notifications',
    assistant: '/settings/assistant',
    assistantAppearance: '/settings/assistant-appearance',
    /** Data model: custom objects, the fields of each record type, connected plugins. */
    dataModel: '/settings/data-model',
    dataObjects: '/settings/data-model/objects',
    dataFields: '/settings/data-model/fields',
    dataFieldsOf: (recordType: string) => `/settings/data-model/fields/${id(recordType)}`,
    dataPlugins: '/settings/data-model/plugins',
  },
} as const;

/** The list each saved view opens on. */
export const LIST_PATHS = {
  customer: paths.contacts.customers,
  company: paths.contacts.companies,
  lead: paths.contacts.leads,
  company_lead: paths.contacts.companyLeads,
  product: paths.products.list,
} satisfies Record<ViewRecordType, string>;
