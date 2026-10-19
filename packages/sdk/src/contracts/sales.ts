import * as z from 'zod';
import { defineContract } from './define';

// sales@1. Additive changes (a new entry, a new optional input field, a new
// output field) may extend v1. Anything that would break an extension written
// against v1 (removing or renaming an entry or field, tightening an input,
// changing what a field means) ships as sales@2 instead, and v1 stays served
// while any install pins it.

export const Priority = z.enum(['Critical', 'High', 'Normal', 'Low']);

// z.object strips fields it doesn't declare, so a call returns only these.
export const DealSummary = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  stageId: z.string(),
  priority: Priority.nullable(),
  description: z.string().nullable(),
  assignedUserIds: z.array(z.string()),
});

export const StageSummary = z.object({
  _id: z.string(),
  name: z.string(),
  order: z.number().nullable(),
  pipelineId: z.string(),
});

export const salesContract = defineContract('sales', 1, [
  {
    name: 'deals.get',
    description:
      'Read one deal by its _id, as the calling user sees it in sales. Returns null when no deal has that _id. Read-only.',
    kind: 'read',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: DealSummary.nullable(),
  },
  {
    name: 'stages.get',
    description:
      "Read one pipeline stage by its _id, including the pipelineId it belongs to. Use it to go from a deal's stageId to its pipeline. Returns null when no stage has that _id. Read-only.",
    kind: 'read',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: StageSummary.nullable(),
  },
]);
