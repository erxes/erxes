import type { IProject } from '@/project/types';
import type { ITask } from '@/task/types';
import type { ITriage } from '@/triage/types/triage';

type GithubTriage = ITriage & {
  githubIssueUrl: string;
  githubIssueNumber: number;
};

export const isGithubTriage = (
  content: ITask | IProject | ITriage,
): content is GithubTriage =>
  content.createdBy === 'system' &&
  typeof content.status === 'number' &&
  'githubIssueUrl' in content &&
  typeof content.githubIssueUrl === 'string' &&
  content.githubIssueUrl.length > 0 &&
  typeof content.githubIssueNumber === 'number';
