import type { BmsElementDetailQuery, BmsElementsQuery } from '~/gql/graphql';

export type IElement = NonNullable<
  NonNullable<NonNullable<BmsElementsQuery['bmsElements']>['list']>[number]
>;

export type IElementTranslation = NonNullable<
  NonNullable<IElement['translations']>[number]
>;

export type IElementDetail = NonNullable<
  BmsElementDetailQuery['bmsElementDetail']
>;
