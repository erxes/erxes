export interface ICustomDomainRecord {
  type: string;
  name: string;
  value: string;
  status: string;
}

export interface ICustomDomain {
  isAvailable: boolean;
  cnameTarget: string;
  hostname?: string | null;
  status?: string | null;
  sslStatus?: string | null;
  dnsStatus?: string | null;
  isActive: boolean;
  verificationErrors?: string[] | null;
  lastCheckedAt?: string | null;
  records: ICustomDomainRecord[];
}
