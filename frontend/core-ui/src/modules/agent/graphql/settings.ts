import { gql } from '@apollo/client';

/**
 * GraphQL documents for the tenant-wide agents settings: the
 * admin-controlled feature flags that shape every user's chat surface
 * (currently the code-mode toggle and its sandbox environment). Reading is
 * open to anyone who can view agents; changing is admin-only server-side
 * (`manageAgentsSettings`), and the UI mirrors that by disabling controls.
 */

export const AGENTS_SETTINGS = gql`
  query AgentsSettings {
    agentsSettings {
      codeModeEnabled
      codeModeEnvironment
      approvalMode
      updatedAt
    }
  }
`;

export const AGENTS_SETTINGS_UPDATE = gql`
  mutation AgentsSettingsUpdate($codeModeEnabled: Boolean, $codeModeEnvironment: String, $approvalMode: String) {
    agentsSettingsUpdate(codeModeEnabled: $codeModeEnabled, codeModeEnvironment: $codeModeEnvironment, approvalMode: $approvalMode) {
      codeModeEnabled
      codeModeEnvironment
      approvalMode
      updatedAt
    }
  }
`;

export type AgentsApprovalMode = 'writes' | 'destructive';

export interface IAgentsSettings {
  codeModeEnabled: boolean | null;
  codeModeEnvironment: string | null;
  approvalMode: AgentsApprovalMode | null;
  updatedAt?: string | null;
}

export interface IAgentsSettingsData {
  agentsSettings: IAgentsSettings | null;
}

export interface IAgentsSettingsUpdateData {
  agentsSettingsUpdate: IAgentsSettings | null;
}

export interface IAgentsSettingsUpdateVariables {
  codeModeEnabled?: boolean;
  codeModeEnvironment?: string;
  approvalMode?: AgentsApprovalMode;
}
