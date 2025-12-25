export enum AppPath {
  //auth
  Login = '/login',
  ResetPassword = '/reset-password',
  CreateOwner = '/create-owner',
  ForgotPassword = '/forgot-password',
  ConfirmInvitation = '/confirmation',

  //main
  Index = '/',
  Settings = 'settings',
  SettingsCatchAll = `/${Settings}/*`,
  MainOnboarding = '/welcome',

  Products = 'products',
  ProductsCatchAll = `/${Products}/*`,

  Contacts = 'contacts',
  ContactsCatchAll = `/${Contacts}/*`,

  Segments = 'segments',
  SegmentsCatchAll = `/${Segments}/*`,
  Automations = 'automations',
  AutomationsCatchAll = `/${Automations}/*`,
  MyInbox = 'my-inbox',
  MyInboxCatchAll = `/${MyInbox}/*`,
  Logs = 'logs',
  LogsCatchAll = `/${Logs}/*`,

  Marketplace = 'marketplace',
  MarketplaceCatchAll = `/${Marketplace}/*`,

  Documents = 'documents',
  DocumentsCatchAll = `/${Documents}/*`,

  ImportExport = 'import-export',
  ImportExportCatchAll = `/${ImportExport}/*`,

  //not found

  NotFoundWildcard = '/*',
  NotFound = '/not-found',

  //dev
  Components = 'components',
  ComponentsCatchAll = `/${Components}/*`,
}
