// Agent learnings = the tenant's MastraLearning digest — the PII-free lessons
// distilled from chat (plus manual/curated entries) that are woven into every
// agent turn's system prompt. Thumbs up/down on a reply reinforces or penalizes
// whichever learnings shaped it; this page is where they are reviewed, pinned,
// promoted, and pruned. (See backend mastra/learning/digest.ts — readLearnedDigest.)

export interface ILearningRow {
  _id: string;
  statement: string;
  type: string;
  contextTags?: string[];
  agentId?: string;
  status: string;
  confidence?: number;
  evidenceCount?: number;
  sourceCount?: number;
  pinned?: boolean;
  createdBy?: string;
  lastReinforcedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type StatusFilter = '' | 'approved' | 'candidate' | 'archived' | 'rejected';

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'candidate', label: 'Candidate' },
  { value: 'archived', label: 'Archived' },
];

// approved is retrievable (what the model reads); rejected/conflict are blocked;
// candidate/archived are inert.
export const statusVariant = (
  status: string,
): 'success' | 'destructive' | 'secondary' => {
  if (status === 'approved') return 'success';
  if (status === 'rejected' || status === 'conflict') return 'destructive';
  return 'secondary';
};

export const confidencePct = (c?: number) =>
  typeof c === 'number' ? `${Math.round(c * 100)}%` : '—';
