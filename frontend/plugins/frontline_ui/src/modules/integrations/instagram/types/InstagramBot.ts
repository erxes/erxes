import type {
  InstagramMessengerBotProfileQuery,
  InstagramMessengerBotQuery,
  InstagramMessengerBotsQuery,
} from '~/gql/graphql';

export type IInstagramBot = NonNullable<
  NonNullable<InstagramMessengerBotsQuery['instagramMessengerBots']>[number]
>;

export type IInstagramBotDetail = NonNullable<
  InstagramMessengerBotQuery['instagramMessengerBot']
>;

export type IInstagramBotProfile = NonNullable<
  InstagramMessengerBotProfileQuery['instagramMessengerBot']
>;

export type IInstagramBotPersistentMenu = NonNullable<
  NonNullable<IInstagramBot['persistentMenus']>[number]
>;
