import type { Models } from '@earendil-works/pi-ai';
import type {
  AgentChange,
  EntryRecord,
  Extension,
  HarnessSettings,
} from '@earendil-works/pi-durable';

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

const MADE_PREFIX = 'agent.';

/** The name an agent an admin made runs under: `agent.<id>`. */
export const madeAgentName = (id: string) => `${MADE_PREFIX}${id}`;

/** The id of an agent an admin made, from its name; null for a registered agent's. */
export const madeAgentId = (name: string) =>
  name.startsWith(MADE_PREFIX) ? name.slice(MADE_PREFIX.length) : null;

/** What the model said in an answer entry, its text parts joined. */
export const answerText = (entry: EntryRecord | undefined) =>
  (entry?.model ?? [])
    .flatMap((message) => (message.role === 'assistant' ? message.content : []))
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join('\n')
    .trim();
