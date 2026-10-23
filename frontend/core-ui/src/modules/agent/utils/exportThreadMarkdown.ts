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
import { extractPageContext } from './pageContext';
import { getMessageText, isAgentsAnswerTurn } from './messages';

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
 * code spans and fences stay literal.
 */
const referencesToLabels = (
  text: string,
  registry: IAgentReferenceRegistry,
): string => {
  const { text: masked, references } = maskAgentReferences(text, (handle) =>
    registry.byHandle.get(handle),
  );

  return masked.replace(AGENT_REFERENCE_PLACEHOLDER_PATTERN, (match, index) => {
    const reference = references[Number(index)];
    return reference
      ? registry.byIdentity.get(referenceIdentity(reference))?.label ??
          reference.label
      : match;
  });
};

/**
 * Renders a thread as Markdown: `## You` / `## AI Agent` turns with text
 * parts only. Skips reasoning/tool parts, ask_user answer echoes
 * (`metadata.agentsAnswer`), and each user turn's leading `[Page context]`
 * block.
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
        lines.push('## You', '', referencesToLabels(text, scopes[index]), '');
      }

      continue;
    }

    if (message.role === 'assistant') {
      const text = getMessageText(message).trim();

      if (text) {
        lines.push(
          '## AI Agent',
          '',
          referencesToLabels(text, scopes[index]),
          '',
        );
      }
    }
  }

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
