import { OperationTemplatesQuery } from '~/gql/graphql';

export type IOperationTemplate = NonNullable<
  NonNullable<OperationTemplatesQuery['operationTemplates']>[number]
>;
