export interface IGithubConnection {
  _id: string;
  installationId: number;
  orgName: string;
  orgAvatarUrl?: string;
  orgType: string;
  createdAt: string;
  isActive: boolean;
}

export interface IGithubConfig {
  _id: string;
  teamId: string;
  repoName: string;
  installationId: number;
  syncMode: 'oneWay' | 'twoWay';
}

export interface IGithubRepository {
  fullName: string;
  name: string;
  isPrivate: boolean;
}

export interface LinkRepoDialogProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  connections: IGithubConnection[];
  currentConfig?: IGithubConfig;
  linkedRepoNames: string[];
  onSaved: () => void;
  onInstallOrganization: () => void;
}
