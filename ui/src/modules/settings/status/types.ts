export type GeneralInfo = {
  packageVersion: string;
};

export type OSInfo = {
  type: string;
  platform: string;
  arch: string;
  release: string;
  uptime: number;
  loadavg: [number];
  totalmem: number;
  freemem: number;
  cpuCount: number;
};

export type ProcessInfo = {
  nodeVersion: string;
  pid: string;
  uptime: string;
};

export type MongoInfo = {
  version: string;
  storageEngine: string;
};

export type ProjectVersions = {
  generalInfo: GeneralInfo;
  osInfo: OSInfo;
  processInfo: ProcessInfo;
  mongoInfo: MongoInfo;
};

export type VersionsQueryResponse = {
  configsVersions: ProjectVersions;
  loading: boolean;
  refetch: () => void;
};
