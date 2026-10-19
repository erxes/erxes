import type { GetWebListQuery } from '~/gql/graphql';

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

export interface IWebCustomDomainRecord {
  type: string;
  name: string;
  value: string;
  status: string;
}

export interface IWebCustomDomain {
  name: string;
  verified: boolean;
  misconfigured: boolean;
  isActive: boolean;
  records: IWebCustomDomainRecord[];
}

export interface IWebCustomDomains {
  isDeployed: boolean;
  defaultDomain: string | null;
  domains: IWebCustomDomain[];
}
