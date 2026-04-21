import { Icon } from '@tabler/icons-react';

export enum SettingsPath {
  Index = 'settings/',
  Profile = 'profile',
  ChangePassword = 'change-password',
  Notification = 'notification',
  NotificationCatchAll = 'notification/*',
  // Experience = 'experience',
}

export enum SettingsWorkspacePath {
  General = 'general',
  FileUpload = 'file-upload',
  MailConfig = 'mail-config',
  ImportExport = 'import-export',
  ImportExportCatchAll = `${ImportExport}/*`,
  Permissions = 'permissions',
  TeamMember = 'team',
  TeamMemberCatchAll = `${TeamMember}/*`,
  Properties = 'properties',
  Structure = 'structures',
  StructureCatchAll = 'structures/*',
  Tags = 'tags',
  Products = 'products',
  ProductsCatchAll = 'products/*',
  Brands = 'brands',
  PropertiesCatchAll = 'properties/*',
  Automations = 'automations',
  AutomationsCatchAll = `${Automations}/*`,
  ContactsCatchAll = 'contacts/*',
  ClientPortals = 'client-portals',
  AppTokens = 'app-tokens',
  OAuthClients = 'oauth-clients',
  ClienPortalsCatchAll = 'client-portals/*',
  Logs = 'logs',
  Broadcast = 'broadcast',
}

export type TSettingPath = {
  name: string;
  icon: Icon;
  path: string;
};
