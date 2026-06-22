import { Document } from 'mongoose';

// A "skill" is procedural memory: a named, authored playbook that teaches the
// agent how to do ONE specific task reliably. It mirrors the Anthropic Agent
// Skills design — a lightweight index (name + description) is always in the
// prompt, and the full `body` is pulled in on demand via the load_skill tool
// (progressive disclosure). This keeps the system prompt lean while letting an
// admin teach the agent any number of tasks without it failing on them.
export interface IMastraAgentSkill {
  // Stable kebab-case identifier the agent passes to load_skill, e.g.
  // "refund-a-paid-order". Unique per tenant.
  name: string;
  // Human-facing label shown in the management UI.
  title: string;
  // The "when to use" trigger — always loaded into the prompt index, so the
  // agent can decide whether this skill is relevant. The single most important
  // field for reliable matching.
  description: string;
  // The full playbook (markdown): step-by-step instructions, the exact
  // operations to run, gotchas, and worked examples. Loaded only when the agent
  // decides the skill applies — so it can be as detailed as needed.
  body: string;
  // Optional free-text tags for grouping/filtering in the UI.
  tags?: string[];
  // Agents this skill is available to. EMPTY = available to every agent
  // (a global playbook); otherwise scoped to the listed agentIds.
  agentIds?: string[];
  // Disabled skills neither appear in the index nor load.
  isEnabled?: boolean;
  createdByUserId?: string;
  // Light telemetry powering future curation ("verified across contexts").
  usageCount?: number;
  lastUsedAt?: Date;
}

export interface IMastraAgentSkillDocument extends IMastraAgentSkill, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// The lean projection used to build the always-loaded prompt index and the
// cache fingerprint. Deliberately excludes `body` — that is the whole point of
// progressive disclosure.
export interface IMastraAgentSkillIndexEntry {
  _id: string;
  name: string;
  title: string;
  description: string;
  updatedAt?: Date;
}
