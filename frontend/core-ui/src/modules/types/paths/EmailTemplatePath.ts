/** Relative route paths used by `EmailTemplatesSettingsRoutes`. */
export enum EmailTemplateRoutesPath {
  Index = '/',
  Create = '/create',
  Detail = '/:id',
}

/** Absolute paths for linking into the email template settings pages. */
export enum EmailTemplatePath {
  Index = '/settings/email-templates',
  Create = `${Index}/create`,
}
