import type { ErxesMessengerIntegrationDetailQuery } from '~/gql/graphql';

export interface EMLink {
  url: string;
}

export type SocialPlatform = 'youtube' | 'facebook' | 'instagram' | 'twitter';

export type SocialLinks = Record<SocialPlatform, string>;

export interface ProcessedLinks {
  links: Partial<SocialLinks>;
  externalLinks: EMLink[];
}

export type IEMIntegrationDetail = NonNullable<
  ErxesMessengerIntegrationDetailQuery['integrationDetail']
>;
