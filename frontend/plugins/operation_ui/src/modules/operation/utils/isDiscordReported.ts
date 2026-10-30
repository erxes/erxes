import type { IProject } from '@/project/types';
import type { ITaskDetail } from '@/task/types';
import type { ITriageDetail } from '@/triage/types/triage';

type TDiscordSource = NonNullable<
  ITaskDetail['discordSource'] | ITriageDetail['discordSource']
> & { username: string };

type DiscordReported = (ITaskDetail | ITriageDetail) & {
  discordSource: TDiscordSource;
};

export const isDiscordReported = (
  content: ITaskDetail | IProject | ITriageDetail,
): content is DiscordReported =>
  content.createdBy === 'system' &&
  'discordSource' in content &&
  typeof content.discordSource?.username === 'string' &&
  content.discordSource.username.length > 0;
