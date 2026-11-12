import { TDiscordMessagePayload } from '@/discordIntegration/@types/discordApi';
import { TDiscordChannelMention } from '@/discordIntegration/@types/discordConfig';
import { TDiscordPullRequest } from '@/discordIntegration/@types/discordNotification';
import {
  DISCORD_LIMITS,
  DISCORD_PULL_REQUEST_COLOR,
} from '@/discordIntegration/constants';
import {
  buildField,
  buildLinkRow,
  escapeDiscordMarkdown,
  truncateDiscordText,
} from '@/discordIntegration/utils/discordCard';
import {
  buildAllowedMentions,
  disarmDiscordMentions,
} from '@/discordIntegration/utils/discordMention';

const HTML_COMMENT = { open: '<!--', close: '-->' };

const LINE_BREAK = /\r\n?/g;

const IMAGE_TAG = /<img\b[^>]*>/gi;

const IMAGE_SOURCE = /\bsrc=["']([^"']+)["']/i;

const MARKDOWN_IMAGE = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

const EXTRA_BLANK_LINES = /\n{3,}/g;

const stripHtmlComments = (value: string) => {
  const parts: string[] = [];
  let cursor = 0;
  let start = value.indexOf(HTML_COMMENT.open);

  while (start !== -1) {
    parts.push(value.slice(cursor, start));

    const end = value.indexOf(
      HTML_COMMENT.close,
      start + HTML_COMMENT.open.length,
    );

    if (end === -1) {
      return parts.join('');
    }

    cursor = end + HTML_COMMENT.close.length;
    start = value.indexOf(HTML_COMMENT.open, cursor);
  }

  parts.push(value.slice(cursor));

  return parts.join('');
};

const describeImageTag = (tag: string) => {
  const source = IMAGE_SOURCE.exec(tag)?.[1];

  return source ? `[image](${source})` : '';
};

const describeMarkdownImage = (_image: string, alt: string, url: string) =>
  `[${alt.trim() || 'image'}](${url})`;

const cleanPullRequestBody = (body: string) =>
  stripHtmlComments(body.replace(LINE_BREAK, '\n'))
    .replace(IMAGE_TAG, describeImageTag)
    .replace(MARKDOWN_IMAGE, describeMarkdownImage)
    .replace(EXTRA_BLANK_LINES, '\n\n')
    .trim();

const describeAuthor = ({ authorLogin, authorUrl }: TDiscordPullRequest) => {
  if (!authorLogin) {
    return '';
  }

  const name = escapeDiscordMarkdown(authorLogin);

  return authorUrl ? `[${name}](${authorUrl})` : name;
};

const describeBranches = ({ headRef, baseRef }: TDiscordPullRequest) =>
  headRef && baseRef ? `\`${headRef}\` → \`${baseRef}\`` : '';

const describeMerge = ({ mergedByLogin, authorLogin }: TDiscordPullRequest) => {
  const mergedBy = mergedByLogin || authorLogin;

  return mergedBy
    ? `🔀 ${mergedBy} merged the pull request`
    : '🔀 Pull request merged';
};

const describeMention = (
  mention: TDiscordChannelMention,
  { number, repoName }: TDiscordPullRequest,
) =>
  truncateDiscordText(
    `@${mention} 🔀 PR #${number} merged in ${escapeDiscordMarkdown(
      disarmDiscordMentions(repoName),
    )}`,
    DISCORD_LIMITS.content,
  );

export const buildDiscordPullRequestMessage = ({
  pullRequest,
  teamName,
  mention,
}: {
  pullRequest: TDiscordPullRequest;
  teamName?: string;
  mention?: TDiscordChannelMention;
}): TDiscordMessagePayload => {
  const description = cleanPullRequestBody(pullRequest.body);

  const fields = [
    { name: 'Repository', value: escapeDiscordMarkdown(pullRequest.repoName) },
    { name: 'Branch', value: describeBranches(pullRequest) },
    { name: 'Author', value: describeAuthor(pullRequest) },
  ]
    .filter(({ value }) => value)
    .map(({ name, value }) => buildField(name, value));

  return {
    ...(mention ? { content: describeMention(mention, pullRequest) } : {}),
    embeds: [
      {
        author: {
          name: truncateDiscordText(
            `${teamName || 'Unknown team'} · erxes Operation`,
            DISCORD_LIMITS.title,
          ),
        },
        title: truncateDiscordText(
          `PR #${pullRequest.number} · ${pullRequest.title}`,
          DISCORD_LIMITS.title,
        ),
        url: pullRequest.url,
        description: truncateDiscordText(
          description || '*No description provided.*',
          DISCORD_LIMITS.description,
        ),
        color: DISCORD_PULL_REQUEST_COLOR,
        fields,
        footer: {
          text: truncateDiscordText(
            describeMerge(pullRequest),
            DISCORD_LIMITS.footer,
          ),
        },
        timestamp: pullRequest.mergedAt || new Date().toISOString(),
      },
    ],
    components: buildLinkRow([
      { label: `GitHub PR #${pullRequest.number}`, url: pullRequest.url },
    ]),
    allowed_mentions: buildAllowedMentions({ channel: mention }),
  };
};
