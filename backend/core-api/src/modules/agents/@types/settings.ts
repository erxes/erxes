import { Document } from 'mongoose';

/**
 * Tenant-wide agents settings. One document per tenant (the tenant scope
 * comes from the per-subdomain mongoose connection this schema is
 * registered on); it carries the admin-controlled feature flags that shape
 * every user's chat surface.
 */
export type AgentsApprovalMode = 'writes' | 'destructive';

export interface IAgentsSettings {
  /** When on, the chat agent additionally carries the code-mode tool. */
  codeModeEnabled: boolean;
  /** Sandbox environment executing model-authored code. */
  codeModeEnvironment: string;
  /** Which tool calls suspend for human approval. Defaults to 'writes'. */
  approvalMode: AgentsApprovalMode;
}

export interface IAgentsSettingsDocument
  extends IAgentsSettings,
    Document {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
