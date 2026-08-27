import { z } from 'zod';
import { segmentFormSchema } from '../states/segmentFormSchema';
import { TSegmentNode } from './segmentNode';

export * from './segmentNode';

export type TSegmentForm = z.infer<typeof segmentFormSchema> & {
  root: TSegmentNode;
};

export type TSegmentVisibility = 'private' | 'team' | 'organization';
export type TSegmentExecutionMode = 'dynamic' | 'materialized';
export type TSegmentStatus = 'draft' | 'building' | 'active' | 'failed';

export interface ISegment {
  _id: string;
  contentType: string;
  name: string;
  description?: string;
  color?: string;
  root: TSegmentNode;
  visibility: TSegmentVisibility;
  ownerId: string;
  teamId?: string;
  executionMode: TSegmentExecutionMode;
  status: TSegmentStatus;
  revision: number;

  /** Absent until the segmentation worker has counted; not the same as zero. */
  membersCount?: number;
  membersCountedAt?: string;

  /** Present only while a rebuild is running. */
  buildStartedAt?: string;
  buildProcessed?: number;
}

export interface ListQueryResponse {
  segments: ISegment[];
}

/**
 * Path to a node inside the form, e.g. `root.children.0.children.1`. The tree
 * nests without limit, so the path is built as a string rather than typed
 * against the form shape.
 */
export type TNodePath = string;

export const childPath = (path: TNodePath, index: number): TNodePath =>
  `${path}.children.${index}`;

/** One day of a segment's life: where it ended, and what moved it there. */
export interface ISegmentDay {
  date: string;
  /** Absent on days the worker never settled the segment. */
  count: number | null;
  joined: number;
  left: number;
}
