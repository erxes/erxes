import { TDiscordMessagePayload } from '@/discordIntegration/@types/discordApi';
import { TDiscordNotificationJob } from '@/discordIntegration/@types/discordNotification';
import { DISCORD_LIMITS } from '@/discordIntegration/constants';
import {
  escapeDiscordMarkdown,
  getUserNames,
  TDiscordCardEntity,
  truncateDiscordText,
} from '@/discordIntegration/utils/discordCard';

const NAME_PREVIEW_LENGTH = 100;

const describeCustomerUpdate = ({
  job,
  title,
  taskLabel,
  assigneeName,
}: {
  job: TDiscordNotificationJob;
  title: string;
  taskLabel: string;
  assigneeName?: string;
}) => {
  switch (job.event) {
    case 'triageAccepted':
      return `✅ Your report **${title}** was accepted as **${taskLabel}**.`;
    case 'triageDeclined':
      return `⛔ Your report **${title}** was declined.`;
    case 'taskAssigned':
      return `👤 **${taskLabel} · ${title}** is now handled by **${escapeDiscordMarkdown(
        assigneeName || 'a team member',
      )}**.`;
    case 'taskCompleted':
      return `🎉 **${taskLabel} · ${title}** is done.`;
    case 'triageCreated':
      return `📥 Your report **${title}** was received.`;
  }
};

export const buildDiscordCustomerRemoval = ({
  label,
  name,
  reporterId,
}: {
  label: string;
  name: string;
  reporterId?: string;
}): TDiscordMessagePayload => ({
  content: truncateDiscordText(
    `${
      reporterId ? `<@${reporterId}> ` : ''
    }🗑 **${label} · ${escapeDiscordMarkdown(
      truncateDiscordText(name, NAME_PREVIEW_LENGTH),
    )}** was removed by the team.`,
    DISCORD_LIMITS.content,
  ),
  allowed_mentions: reporterId ? { users: [reporterId] } : { parse: [] },
});

export const buildDiscordCustomerUpdate = async ({
  entity,
  job,
  reporterId,
}: {
  entity: TDiscordCardEntity;
  job: TDiscordNotificationJob;
  reporterId?: string;
}): Promise<TDiscordMessagePayload> => {
  const { record } = entity;
  const taskLabel = `Task #${record.number ?? 0}`;
  const title = escapeDiscordMarkdown(
    truncateDiscordText(record.name, NAME_PREVIEW_LENGTH),
  );

  const assigneeId =
    entity.kind === 'task' ? entity.record.assigneeId : undefined;
  const assigneeName =
    job.event === 'taskAssigned' && assigneeId
      ? (await getUserNames(job.subdomain, [assigneeId])).get(assigneeId)
      : undefined;
  const reason = job.event === 'triageDeclined' ? job.reason?.trim() : '';
  const mention = reporterId ? `<@${reporterId}> ` : '';

  return {
    content: truncateDiscordText(
      [
        `${mention}${describeCustomerUpdate({
          job,
          title,
          taskLabel,
          assigneeName,
        })}`,
        reason ? `> ${escapeDiscordMarkdown(reason)}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      DISCORD_LIMITS.content,
    ),
    allowed_mentions: reporterId ? { users: [reporterId] } : { parse: [] },
  };
};
