import type {
  GetWebListQuery,
  WebCustomDomainsFieldsFragment,
} from '~/gql/graphql';

export interface IWebThumbnail {
  url?: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
}

export type IWeb = NonNullable<
  NonNullable<GetWebListQuery['getWebList']>[number]
>;

export interface IWebInput {
  name: string;
  description?: string;
  domain?: string;
  templateType?: string;
  templateId?: string;
  clientPortalId?: string;
  thumbnail?: IWebThumbnail | null;
}

export type IWebCustomDomains = WebCustomDomainsFieldsFragment;

export type IWebCustomDomain = IWebCustomDomains['domains'][number];
