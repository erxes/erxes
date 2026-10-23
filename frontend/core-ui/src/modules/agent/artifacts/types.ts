export const ARTIFACT_TYPES = ['html', 'xlsx', 'docx', 'pdf'] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

/** A file delivered separately from assistant reply text. */
export interface IArtifact {
  type: ArtifactType;
  title: string;
  filename: string;
  content: string;
}

export interface IArtifactResult {
  kind: 'artifact';
  version: 1;
  artifact: IArtifact;
}
