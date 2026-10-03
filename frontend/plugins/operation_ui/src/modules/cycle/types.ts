import { addCycleSchema } from './validations';
import type {
  CycleInput,
  GetActiveCyclesQuery,
  GetCycleDetailQuery,
  GetCycleProgressByMemberQuery,
  GetCycleProgressByProjectQuery,
  GetCycleProgressChartQuery,
  GetCycleProgressQuery,
} from '~/gql/graphql';
import { z } from 'zod';

export type ICycle = NonNullable<GetCycleDetailQuery['getCycle']>;

export type IActiveCycle = NonNullable<
  NonNullable<
    NonNullable<GetActiveCyclesQuery['getCyclesActive']>['list']
  >[number]
>;

export type ICycleInput = CycleInput;

export type ICycleInputType = z.infer<typeof addCycleSchema>;

export type ICycleProgressByMember =
  GetCycleProgressByMemberQuery['getCycleProgressByMember'][number];

export type ICycleProgressByProject =
  GetCycleProgressByProjectQuery['getCycleProgressByProject'][number];

export type ICycleProgressChart = NonNullable<
  GetCycleProgressChartQuery['getCycleProgressChart']
>;

export type ICycleStatistics = NonNullable<
  NonNullable<GetCycleDetailQuery['getCycle']>['statistics']
>;

export type ICycleProgress = NonNullable<
  GetCycleProgressQuery['getCycleProgress']
>;
