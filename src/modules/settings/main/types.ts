export type Versions = {
  packageVersion: string;
  lastCommittedUser: string;
  lastCommittedDate: string;
  lastCommitMessage: string;
  branch: string;
  sha: string;
  abbreviatedSha: string;
};

export type ProjectVersions = {
  erxesVersion: Versions;
  apiVersion: Versions;
  widgetVersion: Versions;
  widgetApiVersion: Versions;
};

export type VersionsQueryResponse = {
  versions: ProjectVersions;
  loading: boolean;
  refetch: () => void;
};
