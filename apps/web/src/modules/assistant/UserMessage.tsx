import {
  AssistantAction,
  AssistantMentions,
  type AssistantMessagePart,
} from '@erxes/core-contract';
import { CopyButton } from './CopyButton';
import { MessageAttachments } from './MessageAttachments';
import { MessageText } from './MessageText';
import { userText } from './transcriptRows';

const mentionsOf = (parts: AssistantMessagePart[]) =>
  parts.flatMap((part) =>
    part.type === 'data-mentions'
      ? (AssistantMentions.safeParse(part['data']).data?.mentions ?? [])
      : [],
  );

const valueText = (value: unknown) => {
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string').join(', ');

  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
};

const nameOf = (key: string) => {
  const words = key
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
};

const valuesOf = (parts: AssistantMessagePart[]) =>
  parts
    .flatMap((part) =>
      part.type === 'data-action'
        ? Object.entries(AssistantAction.safeParse(part['data']).data?.context ?? {})
        : [],
    )
    .map(([key, value]) => ({ name: nameOf(key), text: valueText(value) }))
    .filter(({ text }) => text);

const ActionValues = ({ parts }: { parts: AssistantMessagePart[] }) => {
  const values = valuesOf(parts);

  if (!values.length) return null;

  return (
    <dl className="flex max-w-5/6 flex-col gap-0.5 text-xs text-muted-foreground">
      {values.map(({ name, text }) => (
        <div key={name} className="flex justify-end gap-2">
          <dt className="shrink-0">{name}</dt>
          <dd className="min-w-0 break-words text-foreground">{text}</dd>
        </div>
      ))}
    </dl>
  );
};

export const UserMessage = ({ parts }: { parts: AssistantMessagePart[] }) => {
  const text = userText(parts);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <MessageAttachments parts={parts} />
      {text && (
        <div className="group flex w-full items-start justify-end gap-1">
          <div className="flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <CopyButton text={text} />
          </div>
          <p className="max-w-5/6 rounded-xl rounded-br-sm bg-accent px-3 py-2 text-sm whitespace-pre-wrap break-words">
            <MessageText text={text} mentions={mentionsOf(parts)} />
          </p>
        </div>
      )}
      <ActionValues parts={parts} />
    </div>
  );
};
