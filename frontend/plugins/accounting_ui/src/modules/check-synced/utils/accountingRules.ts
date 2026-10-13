import { z } from 'zod';
import type { AccountingsConfigsQuery } from '~/gql/graphql';
import { toGraphqlView } from '@/utils/graphql';

const ruleValueSchema = z.object({
  title: z.string().optional(),
  posId: z.string().optional(),
  boardId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
  returnType: z.enum(['delete', 'fullTr', 'onlySale']).optional(),
});

type AccountingConfig = NonNullable<
  NonNullable<AccountingsConfigsQuery['accountingsConfigs']>[number]
>;

export const normalizeAccountingRule = (config: AccountingConfig) => {
  const parsed = ruleValueSchema.safeParse(config.value);
  return {
    ...toGraphqlView(config),
    value: parsed.success ? parsed.data : undefined,
  };
};
