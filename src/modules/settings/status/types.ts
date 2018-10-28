export type Version = {
  packageVersion: string;
  lastCommittedUser: string;
  lastCommittedDate: string;
  lastCommitMessage: string;
  branch: string;
  sha: string;
  abbreviatedSha: string;
};

export type ProjectVersions = {
  erxesVersion: Version;
  apiVersion: Version;
  widgetVersion: Version;
  widgetApiVersion: Version;
};

export type VersionsQueryResponse = {
  configsVersions: ProjectVersions;
  loading: boolean;
  refetch: () => void;
};
