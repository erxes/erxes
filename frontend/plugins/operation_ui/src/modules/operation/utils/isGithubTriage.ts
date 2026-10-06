import type { IProject } from '@/project/types';
import type { ITaskDetail } from '@/task/types';
import type { ITriageDetail } from '@/triage/types/triage';

type GithubTriage = ITriageDetail & {
  githubIssueUrl: string;
  githubIssueNumber: number;
};

export const isGithubTriage = (
  content: ITaskDetail | IProject | ITriageDetail,
): content is GithubTriage =>
  content.createdBy === 'system' &&
  typeof content.status === 'number' &&
  'githubIssueUrl' in content &&
  typeof content.githubIssueUrl === 'string' &&
  content.githubIssueUrl.length > 0 &&
  typeof content.githubIssueNumber === 'number';
