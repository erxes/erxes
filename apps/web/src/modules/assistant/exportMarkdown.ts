import type { AssistantArtifact } from '@erxes/core-contract';
import { getToolName, isTextUIPart, isToolUIPart, type UIMessage } from 'ai';
import { fileDownloadUrl } from '~/lib/files';
import { csvRows } from './artifacts/csvRows';
import { sizeLabel, typeLabel } from './attachments';
import { attachmentsOf } from './MessageAttachments';
import { answeredQuestions, artifactOf } from './transcriptRows';

type Part = UIMessage['parts'][number];

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

const attachmentLines = (message: UIMessage, origin: string) => {
  const { files, selections } = attachmentsOf(message);

  return [
    ...files.map(
      (file) =>
        `- [${file.name}](${origin}${fileDownloadUrl(file.id)}) (${typeLabel(file)} · ${sizeLabel(file.size)})`,
    ),
    ...selections.map((selection) => `- Page selection: ${selection.title} (${selection.path})`),
  ];
};

const blockOf = (part: Part) => {
  if (isTextUIPart(part)) return part.text.trim() ? [part.text.trim()] : [];

  if (isToolUIPart(part) && getToolName(part) === 'createArtifact') {
    const artifact = artifactOf(part);

    return artifact ? [artifactBlock(artifact)] : [];
  }

  const answers = answeredQuestions(part);

  return answers
    ? [answers.map(({ question, answer }) => `> ${question}\n> ${answer}`).join('\n>\n')]
    : [];
};

const blocksOf = (message: UIMessage, origin: string) => {
  const attachments = attachmentLines(message, origin);

  return [
    ...message.parts.flatMap(blockOf),
    ...(attachments.length ? [attachments.join('\n')] : []),
  ];
};

export const threadMarkdown = (title: string, messages: UIMessage[], origin: string) =>
  [
    `# ${title}`,
    ...messages.flatMap((message) => [
      `## ${message.role === 'user' ? 'You' : 'Assistant'}`,
      ...blocksOf(message, origin),
    ]),
  ]
    .map((block) => `${block}\n`)
    .join('\n');
