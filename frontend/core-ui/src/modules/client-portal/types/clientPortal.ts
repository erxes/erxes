export interface IClientPortal {
  _id?: string;
  name?: string;
  description?: string;
  domain?: string;
  createdAt?: string;
  updatedAt?: string;
  token?: string;
}

export enum ClientPortalHotKeyScope {
  ClientPortalSettingsPage = 'client-portal-settings-page',
  ClientPortalAddSheet = 'client-portal-add-sheet',
}
