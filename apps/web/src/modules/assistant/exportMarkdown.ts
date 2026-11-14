import { AssistantArtifact, AssistantFiles, AssistantSelections } from '@erxes/core-contract';
import { getToolName, isTextUIPart, isToolUIPart, type UIMessage } from 'ai';
import { csvRows } from './artifacts/csvRows';
import { fileUrl, sizeLabel, typeLabel } from './attachments';
import { answeredQuestions } from './transcriptRows';

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

const attachmentLines = (part: Part, origin: string) => {
  if (part.type === 'data-files') {
    return (AssistantFiles.safeParse(part.data).data?.files ?? []).map(
      (file) =>
        `- [${file.name}](${origin}${fileUrl(file.id)}) (${typeLabel(file)} · ${sizeLabel(file.size)})`,
    );
  }

  if (part.type === 'data-selections') {
    return (AssistantSelections.safeParse(part.data).data?.selections ?? []).map(
      (selection) => `- Page selection: ${selection.title} (${selection.path})`,
    );
  }

  return [];
};

const blockOf = (part: Part) => {
  if (isTextUIPart(part)) return part.text.trim() ? [part.text.trim()] : [];

  if (isToolUIPart(part) && getToolName(part) === 'createArtifact') {
    const artifact =
      part.state === 'output-available' ? AssistantArtifact.safeParse(part.output).data : undefined;

    return artifact ? [artifactBlock(artifact)] : [];
  }

  const answers = answeredQuestions(part);

  return answers
    ? [answers.map(({ question, answer }) => `> ${question}\n> ${answer}`).join('\n>\n')]
    : [];
};

const blocksOf = (message: UIMessage, origin: string) => {
  const attachments = message.parts.flatMap((part) => attachmentLines(part, origin));

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
