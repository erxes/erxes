import type {
  FacebookMessengerBotListFieldsFragment,
  FacebookMessengerBotProfileQuery,
  FacebootMessengerBotQuery,
} from '~/gql/graphql';

export type IFacebookBot = FacebookMessengerBotListFieldsFragment;

export type IFacebookBotDetail = NonNullable<
  FacebootMessengerBotQuery['facebookMessengerBot']
>;

export type IFacebookBotProfile = NonNullable<
  FacebookMessengerBotProfileQuery['facebookMessengerBot']
>;

export type IFacebookBotPersistentMenu = NonNullable<
  NonNullable<IFacebookBot['persistentMenus']>[number]
>;

export type IFacebookBotIceBreaker = NonNullable<
  NonNullable<IFacebookBot['iceBreakers']>[number]
>;

export type IFacebookBotHealth = NonNullable<IFacebookBot['health']>;

export type IFacebookBotUser = NonNullable<IFacebookBot['createdUser']>;
