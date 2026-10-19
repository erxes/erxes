import * as z from 'zod';
import { defineContract } from '../define';

// z.object strips fields it doesn't declare, so a call returns only these.
export const DealSummary = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  stageId: z.string().nullable(),
  // Free-form in sales. Newer deals hold the priority picker's index, "0" to
  // "4" (No Priority, Minor, Medium, High, Critical); older or API-written
  // deals may hold a label such as "High" or "Normal".
  priority: z.string().nullable(),
  description: z.string().nullable(),
  assignedUserIds: z.array(z.string()).nullable(),
});

export const StageSummary = z.object({
  _id: z.string(),
  name: z.string(),
  order: z.number().nullable(),
  pipelineId: z.string(),
});

export const salesBaseContract = defineContract('sales', 1, [
  {
    name: 'deals.get',
    description:
      'Read one deal by its _id, as the calling user sees it in sales. Returns null when no deal has that _id. priority is a string: "0" to "4" for deals set with the priority picker (No Priority, Minor, Medium, High, Critical), or a label such as "High" on older deals. Read-only.',
    kind: 'read',
    // No clientPortalCard: with it, dealDetail skips the caller's checks.
    field: 'dealDetail',
    args: { _id: 'String!' },
    notFound: 'Deal not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: DealSummary.nullable(),
  },
  {
    name: 'stages.get',
    description:
      "Read one pipeline stage by its _id, including the pipelineId it belongs to. Use it to go from a deal's stageId to its pipeline. Returns null when no stage has that _id. Read-only.",
    kind: 'read',
    field: 'salesStageDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: StageSummary.nullable(),
  },
]);
