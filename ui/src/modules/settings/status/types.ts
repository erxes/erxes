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

type Statistic = {
  os: OSInfo;
  process: ProcessInfo;
  mongo: MongoInfo;
};

export type ProjectStatistics = {
  erxes: { packageVersion: string };
  erxesApi: Statistic;
};

export type VersionsQueryResponse = {
  configsStatus: ProjectStatistics;
  loading: boolean;
  refetch: () => void;
};
