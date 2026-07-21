export enum AutomationsPath {
  Index = '/',
  Create = '/create',
  Detail = '/edit/:id',
}

/** Relative route paths used by `AutomationSettingsRoutes`. */
export enum AutomationSettingsRoutesPath {
  Agents = '/agents',
  AgentDetail = `${Agents}/:id`,
  AgentCreate = `${Agents}/create`,
  Bots = '/bots',
  BotDetail = `${Bots}/:type`,
  EmailTemplates = '/email-templates',
  EmailTemplateDetail = `${EmailTemplates}/:id`,
  EmailTemplateCreate = `${EmailTemplates}/create`,
}

/** Absolute paths for linking into automation settings pages. */
export enum AutomationSettingsPath {
  Index = '/settings/automations',
  Agents = `${Index}/agents`,
  AgentCreate = `${Agents}/create`,
  Bots = `${Index}/bots`,
  EmailTemplates = `${Index}/email-templates`,
  EmailTemplateCreate = `${EmailTemplates}/create`,
}
