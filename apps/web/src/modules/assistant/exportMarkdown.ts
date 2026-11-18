import type { AssistantArtifact, AssistantMessagePart } from '@erxes/core-contract';
import { fileDownloadUrl } from '~/lib/files';
import { csvRows } from './artifacts/csvRows';
import { sizeLabel, typeLabel } from './attachments';
import { attachmentsOf } from './MessageAttachments';
import { type TranscriptMessage, type TranscriptRow, userText } from './transcriptRows';

const cell = (text: string) => text.replaceAll('|', '\\|').replaceAll('\n', ' ');

const markdownTable = (csv: string) => {
  const [head, ...body] = csvRows(csv);

  if (!head) return '';

  return [head, head.map(() => '---'), ...body]
    .map((row) => `| ${row.map(cell).join(' | ')} |`)
    .join('\n');
};

const artifactBlock = (artifact: AssistantArtifact) => {
  const content = {
    markdown: () => artifact.content.trim(),
    csv: () => markdownTable(artifact.content),
    html: () => `\`\`\`html\n${artifact.content.trim()}\n\`\`\``,
  }[artifact.format]();

  return `### ${artifact.title}\n\n${content}`;
};

const userBlocks = (parts: AssistantMessagePart[], origin: string) => {
  const text = userText(parts);
  const { files, selections } = attachmentsOf(parts);

  const attachments = [
    ...files.map(
      (file) =>
        `- [${file.name}](${origin}${fileDownloadUrl(file.id)}) (${typeLabel(file)} · ${sizeLabel(file.size)})`,
    ),
    ...selections.map((selection) => `- Page selection: ${selection.title} (${selection.path})`),
  ];

  return [...(text ? [text] : []), ...(attachments.length ? [attachments.join('\n')] : [])];
};

const replyBlocks = (rows: TranscriptRow[]) =>
  rows.flatMap((row) => {
    if (row.kind === 'text') return [row.text.trim()];

    return row.kind === 'artifact' ? [artifactBlock(row.artifact)] : [];
  });

export const threadMarkdown = (title: string, messages: TranscriptMessage[], origin: string) =>
  [
    `# ${title}`,
    ...messages.flatMap((message) =>
      message.role === 'user'
        ? ['## You', ...userBlocks(message.parts, origin)]
        : ['## Assistant', ...replyBlocks(message.rows)],
    ),
  ]
    .map((block) => `${block}\n`)
    .join('\n');
