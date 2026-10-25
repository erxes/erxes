import {
  buildAgentReferenceScopes,
  referenceIdentity,
  type IAgentReferenceRegistry,
} from '../references/referenceRegistry';
import type { TextUIPart, UIMessage } from 'ai';

import {
  AGENT_REFERENCE_PLACEHOLDER_PATTERN,
  maskAgentReferences,
} from '../references/maskAgentReferences';
import { readAgentMentions } from '../agentMentions';
import { agentTurnAnswerText } from './agentTurnTimeline';
import { extractPageContext } from './pageContext';
import { isAgentsAnswerTurn } from './messages';

// `ai` is ESM-only — `import type` only so jest (CJS) can load this util.
const isTextPart = (part: UIMessage['parts'][number]): part is TextUIPart =>
  part.type === 'text';

export interface IBuildThreadMarkdownArgs {
  title: string;
  messages: UIMessage[];
  exportedAt: Date;
}

/**
 * Rewrites valid `[[type:id:label]]` tokens as their label for export —
 * readers of the .md file get the record name, not the internal token.
 * `maskAgentReferences` masks only outside code regions, so tokens inside
 * code spans and fences stay literal. The user's own mentions keep the
 * `@Label` form they were typed in, matching Copy.
 */
const referencesToLabels = (
  text: string,
  registry: IAgentReferenceRegistry,
  mentioned: ReadonlySet<string> = new Set(),
): string => {
  const { text: masked, references } = maskAgentReferences(text, (handle) =>
    registry.byHandle.get(handle),
  );

  return masked.replace(AGENT_REFERENCE_PLACEHOLDER_PATTERN, (match, index) => {
    const reference = references[Number(index)];
    if (!reference) return match;
    const label =
      registry.byIdentity.get(referenceIdentity(reference))?.label ??
      reference.label;
    return mentioned.has(referenceIdentity(reference)) ? `@${label}` : label;
  });
};

/**
 * Renders a thread as Markdown: `## You` / `## AI Agent` turns with text
 * parts only. Consecutive assistant messages separated only by skipped
 * user turns form one agent turn, exported as its final answer: narration
 * between steps, reasoning and tool parts stay out, like Copy. Skips
 * ask_user answer echoes (`metadata.agentsAnswer`) and each user turn's
 * leading `[Page context]` block.
 */
export const buildThreadMarkdown = ({
  title,
  messages,
  exportedAt,
}: IBuildThreadMarkdownArgs): string => {
  const lines: string[] = [
    `# ${title}`,
    '',
    `_Exported ${exportedAt.toISOString()}_`,
    '',
  ];

  const scopes = buildAgentReferenceScopes(messages);
  let turnParts: UIMessage['parts'] = [];
  let turnLastIndex = -1;

  const flushTurn = () => {
    const text = agentTurnAnswerText(turnParts).trim();

    if (text) {
      lines.push(
        '## AI Agent',
        '',
        referencesToLabels(text, scopes[turnLastIndex]),
        '',
      );
    }

    turnParts = [];
  };

  for (const [index, message] of messages.entries()) {
    if (message.role === 'user') {
      if (isAgentsAnswerTurn(message)) {
        continue;
      }

      const { parts } = extractPageContext(message.parts);
      const text = parts
        .filter(isTextPart)
        .map((part) => part.text)
        .join('\n\n')
        .trim();

      if (text) {
        flushTurn();
        const mentioned = new Set(
          readAgentMentions(message.parts).map(referenceIdentity),
        );
        lines.push(
          '## You',
          '',
          referencesToLabels(text, scopes[index], mentioned),
          '',
        );
      }

      continue;
    }

    if (message.role === 'assistant') {
      turnParts = [...turnParts, ...message.parts];
      turnLastIndex = index;
    }
  }

  flushTurn();

  return `${lines.join('\n').trimEnd()}\n`;
};

/** `My great thread` → `my-great-thread`; empty input → '' (caller falls back). */
export const slugifyThreadTitle = (title: string): string =>
  title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Downloads a markdown document in-browser. Filename is the slugified
 * title, or `conversation-<YYYY-MM-DD>.md` when the title is empty.
 */
export const downloadThreadMarkdown = (
  title: string | undefined,
  markdown: string,
  exportedAt: Date,
): void => {
  const slug = title ? slugifyThreadTitle(title) : '';
  const date = exportedAt.toISOString().slice(0, 10);
  const filename = slug ? `${slug}.md` : `conversation-${date}.md`;

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
};
