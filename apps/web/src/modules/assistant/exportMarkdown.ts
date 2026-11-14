import { isTextUIPart, type UIMessage } from 'ai';
import { answeredQuestions } from './transcriptRows';

const blocksOf = (message: UIMessage) =>
  message.parts.flatMap((part) => {
    if (isTextUIPart(part)) return part.text.trim() ? [part.text.trim()] : [];

    const answers = answeredQuestions(part);

    return answers
      ? [answers.map(({ question, answer }) => `> ${question}\n> ${answer}`).join('\n>\n')]
      : [];
  });

export const threadMarkdown = (title: string, messages: UIMessage[]) =>
  [
    `# ${title}`,
    ...messages.flatMap((message) => [
      `## ${message.role === 'user' ? 'You' : 'Assistant'}`,
      ...blocksOf(message),
    ]),
  ]
    .map((block) => `${block}\n`)
    .join('\n');
