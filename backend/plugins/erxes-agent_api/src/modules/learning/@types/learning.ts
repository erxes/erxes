import { Document } from 'mongoose';

// What kind of lesson a learning captures. Mirrors the distillation
// extractor's output vocabulary (see mastra/learning/extractor.ts).
export type MastraLearningType =
  | 'faq'
  | 'procedure'
  | 'pitfall'
  | 'product-fact'
  | 'preference';

// Lifecycle: candidates come out of distillation; approval (manual or
// auto via the k-anonymity + confidence floor) makes a learning retrievable;
// conflict marks a candidate that contradicts an approved learning.
export type MastraLearningStatus =
  | 'candidate'
  | 'approved'
  | 'rejected'
  | 'conflict'
  | 'archived';

// One generalized, PII-free lesson in the tenant's shared "Agent knowledge".
// Personal facts NEVER land here — they stay in MastraWorkingMemory. The only
// producer is the distillation pipeline (sanitize → privacy gate → dedupe),
// plus manual entries from the curation UI.
export interface IMastraLearning {
  statement: string;
  type: MastraLearningType;
  contextTags?: string[];
  // Empty/absent = applies to every agent in the tenant.
  agentId?: string;
  status: MastraLearningStatus;
  // 0..1 — extractor estimate, nudged by feedback reinforcement and decay.
  confidence: number;
  // Times this lesson was independently re-derived (merge hits).
  evidenceCount: number;
  // HMAC(resourceId) of contributors — supports the k-anonymity promotion
  // floor and GDPR erasure propagation without storing raw identities.
  sourceHashes: string[];
  // Pinned learnings are always part of the prompt digest.
  pinned?: boolean;
  // 'system' for distilled learnings, a user _id for manual/curated ones.
  createdBy?: string;
  reviewedByUserId?: string;
  lastReinforcedAt?: Date;
}

export interface IMastraLearningDocument extends IMastraLearning, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Explicit user feedback on one assistant message. `learningIdsInContext`
// snapshots which learnings were injected into that turn, so a rating can be
// attributed back to the lessons that shaped the reply.
export interface IMastraFeedback {
  threadId: string;
  messageId: string;
  userId: string;
  rating: 1 | -1;
  comment?: string;
  learningIdsInContext?: string[];
}

export interface IMastraFeedbackDocument extends IMastraFeedback, Document {
  _id: string;
  createdAt: Date;
}
