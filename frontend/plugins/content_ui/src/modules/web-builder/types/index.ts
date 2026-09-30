export interface IWebThumbnail {
  url?: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
}

export interface IWeb {
  _id: string;
  name: string;
  description?: string;
  domain?: string;
  templateType?: string;
  templateId?: string;
  clientPortalId?: string;
  thumbnail?: IWebThumbnail;
}

export interface IWebInput {
  name: string;
  description?: string;
  domain?: string;
  templateType?: string;
  templateId?: string;
  clientPortalId?: string;
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
  defaultDomain?: string | null;
  domains: IWebCustomDomain[];
}
