import {
  APIActionRowComponent,
  APIAttachment,
  APIButtonComponentWithURL,
  APIEmbed,
  ButtonStyle,
  ComponentType,
} from 'discord-api-types/v10';
import { type DiscordMessageAttachment } from '@/integrations/discord/@types/outgoingMessage';
import { DiscordEmbed } from '@/integrations/discord/@types/activity';
import {
  type TDiscordEmbed,
  type TDiscordButton,
} from '@/integrations/discord/@types/automationMessage';

// Discord embed colour wants an integer. Accept "#5865F2" or a decimal string.
const parseEmbedColor = (color?: string): number | undefined => {
  if (!color) return undefined;
  const trimmed = color.trim();
  const value = trimmed.startsWith('#')
    ? Number.parseInt(trimmed.slice(1), 16)
    : Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
};

// Builds a single embed object from the form's flat fields, omitting blanks.
export const buildEmbeds = (embed?: TDiscordEmbed): APIEmbed[] => {
  if (!embed) return [];

  const out: APIEmbed = {};
  if (embed.title?.trim()) out.title = embed.title.trim();
  if (embed.description?.trim()) out.description = embed.description.trim();
  if (embed.url?.trim()) out.url = embed.url.trim();
  const color = parseEmbedColor(embed.color);
  if (color !== undefined) out.color = color;
  if (embed.imageUrl?.trim()) out.image = { url: embed.imageUrl.trim() };

  return Object.keys(out).length ? [out] : [];
};

// Builds message components: link buttons grouped into action rows of 5. Only
// link buttons are supported — interactive (custom_id) buttons need the
// interactions webhook, which is parked.
export const buildComponents = (
  buttons?: TDiscordButton[],
): APIActionRowComponent<APIButtonComponentWithURL>[] => {
  const valid = (buttons || []).filter(
    (b) => b?.label?.trim() && b?.url?.trim(),
  );
  if (!valid.length) return [];

  const rows: APIActionRowComponent<APIButtonComponentWithURL>[] = [];
  for (let i = 0; i < valid.length; i += 5) {
    rows.push({
      type: ComponentType.ActionRow,
      components: valid.slice(i, i + 5).map((b) => ({
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        label: (b.label as string).trim(),
        url: (b.url as string).trim(),
      })),
    });
  }
  return rows;
};

/** Keep only attachments that carry a non-empty URL. */
export const buildFiles = (
  attachments?: DiscordMessageAttachment[],
): DiscordMessageAttachment[] =>
  (attachments || []).filter((a) => a?.url?.trim());

// Maps Discord's create-message response `attachments` into the inbox
// attachment shape, mirroring the inbound gateway mapping in `activity.ts`.
export const normalizeSentAttachments = (attachments?: APIAttachment[]) =>
  (Array.isArray(attachments) ? attachments : []).map((att) => ({
    type: att?.content_type || 'application/octet-stream',
    url: att?.url || '',
    name: att?.filename || '',
    size: typeof att?.size === 'number' ? att.size : undefined,
  }));

// Link buttons have no dedicated inbox renderer, so surface each as a
// titled-link embed card — the embed renders its `title` as a clickable link
// when `url` is set — otherwise a button-only reply would show as a blank
// bubble. Filtered to the same valid buttons `buildComponents` sends.
export const buttonsToMirrorEmbeds = (
  buttons?: TDiscordButton[],
): DiscordEmbed[] =>
  (buttons || [])
    .filter((b) => b?.label?.trim() && b?.url?.trim())
    .map((b) => ({
      title: (b.label as string).trim(),
      url: (b.url as string).trim(),
    }));
