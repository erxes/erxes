import type { Models } from '@earendil-works/pi-ai';
import type { AgentChange, Extension, HarnessSettings } from '@earendil-works/pi-durable';

/** One conversation of an agent: its organisation, and the key the agent names it by, such as a thread id. */
export interface AgentScope {
  orgId: string;
  key: string;
}

/** What one conversation's Harness runs with. */
interface AgentSetup {
  models: Models;
  extensions: Extension[];
  settings?: HarnessSettings;
  /** The root conversation's agent when the conversation is new. */
  agent?: AgentChange;
}

/**
 * An agent core runs on pi-durable. Its name prefixes its storages (`<name>:<key>`). `setup` runs
 * whenever a server opens one of its conversations, so the owner, keys and tools are read fresh.
 */
export interface Agent {
  name: string;
  setup(scope: AgentScope): Promise<AgentSetup>;
}
