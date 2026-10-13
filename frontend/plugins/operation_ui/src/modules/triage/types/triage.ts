import type {
  OperationGetTriageListQuery,
  OperationGetTriageQuery,
} from '~/gql/graphql';
import { z } from 'zod';

export type ITriage = NonNullable<
  NonNullable<
    NonNullable<OperationGetTriageListQuery['operationGetTriageList']>['list']
  >[number]
>;

export type ITriageDetail = NonNullable<
  OperationGetTriageQuery['operationGetTriage']
>;

export interface IAddTriage {
  name: string;
  description: string;
  teamId: string;
  priority: number;
  status: number;
}

export const addTriageSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  teamId: z.string().min(1),
  priority: z.number().optional(),
  status: z.number().optional(),
});
