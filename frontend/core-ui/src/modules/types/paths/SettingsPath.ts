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
  Apps = 'apps',
  Permissions = 'permissions',
  TeamMember = 'team',
  TeamMemberCatchAll = `${TeamMember}/*`,
  Properties = 'properties',
  // Structure = 'structures',
  // StructureCatchAll = 'structures/*',
  Tags = 'tags',
  Products = 'products',
  ProductsCatchAll = 'products/*',
  Brands = 'brands',
  PropertiesCatchAll = 'properties/*',
  AutomationsCatchAll = 'automations/*',
  ContactsCatchAll = 'contacts/*',
  ClientPortals = 'client-portals',
  ClienPortalsCatchAll = 'client-portals/*',
  Logs = 'logs',
  Broadcast = 'broadcast',
}

export type TSettingPath = {
  name: string;
  icon: Icon;
  path: string;
  helpUrl?: string;
  shortDescription?: string;
};
