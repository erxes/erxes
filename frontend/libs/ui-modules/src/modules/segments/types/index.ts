import { z } from 'zod';
import { segmentFormSchema } from '../states/segmentFormSchema';
import { TSegmentNode } from './segmentNode';

export * from './segmentNode';

export type TSegmentForm = z.infer<typeof segmentFormSchema> & {
  root: TSegmentNode;
};

export type TSegmentVisibility = 'private' | 'organization';
export type TSegmentStatus =
  | 'draft'
  | 'building'
  | 'active'
  | 'failed'
  | 'cancelled';

export interface ISegment {
  _id: string;
  contentType: string;
  name?: string;
  description?: string;
  ownedBy?: string;
  color?: string;
  root: TSegmentNode;
  visibility: TSegmentVisibility;
  ownerId: string;
  status: TSegmentStatus;
  revision: number;

  membersCount?: number;
  membersCountedAt?: string;

  buildStartedAt?: string;
  buildProcessed?: number;
  buildTotal?: number;
  buildCancelRequested?: boolean;
}

export interface ListQueryResponse {
  segments: ISegment[];
}

export type TNodePath = string;

export const childPath = (path: TNodePath, index: number): TNodePath =>
  `${path}.children.${index}`;

export interface ISegmentDay {
  at: string;
  date: string;
  count: number | null;
  joined: number;
  left: number;
}

export interface ISegmentUsage {
  segmentId: string;
  automations: { _id: string; name?: string; status?: string }[];
  segments: { _id: string; name?: string }[];
}
