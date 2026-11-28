import {
  AssistantAction,
  AssistantAutomation,
  AssistantMentions,
  type AssistantMessagePart,
} from '@erxes/core-contract';
import { IconTag } from '@tabler/icons-react';
import { badgeVariants, cn } from 'erxes-ui';
import { CopyButton } from './CopyButton';
import { MessageAttachments } from './MessageAttachments';
import { MessageText } from './MessageText';
import { RecordChip } from './RecordChip';
import { userText } from './transcriptRows';
import { pickedRecord } from './ui/components/values';

const mentionsOf = (parts: AssistantMessagePart[]) =>
  parts.flatMap((part) =>
    part.type === 'data-mentions'
      ? (AssistantMentions.safeParse(part['data']).data?.mentions ?? [])
      : [],
  );

const valueItems = (value: unknown) => {
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string');

  return typeof value === 'string' || typeof value === 'number' ? [String(value)] : [];
};

const ValueItem = ({ item }: { item: string }) => {
  const picked = pickedRecord(item);

  if (!picked) return <span>{item}</span>;

  if (picked.kind === 'tag') {
    return (
      <span className={cn(badgeVariants({ variant: 'secondary' }), 'max-w-full')}>
        <IconTag aria-hidden className="size-3 shrink-0" />
        <span className="truncate">{picked.name || picked.id}</span>
      </span>
    );
  }

  return <RecordChip type={picked.kind} id={picked.id} label={picked.name || picked.id} />;
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
    .map(([key, value]) => ({ name: nameOf(key), items: valueItems(value) }))
    .filter(({ items }) => items.length > 0);

const ActionValues = ({ parts }: { parts: AssistantMessagePart[] }) => {
  const values = valuesOf(parts);

  if (!values.length) return null;

  return (
    <dl className="flex max-w-5/6 flex-col gap-1 rounded-xl border px-3 py-2 text-xs text-muted-foreground">
      {values.map(({ name, items }) => (
        <div key={name} className="flex items-center justify-between gap-3">
          <dt className="shrink-0">{name}</dt>
          <dd className="flex min-w-0 flex-wrap justify-end gap-1 break-words text-foreground">
            {items.map((item) => (
              <ValueItem key={item} item={item} />
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
};

const automationOf = (parts: AssistantMessagePart[]) =>
  parts.flatMap((part) =>
    part.type === 'data-automation' ? (AssistantAutomation.safeParse(part['data']).data ?? []) : [],
  )[0];

export const UserMessage = ({ parts }: { parts: AssistantMessagePart[] }) => {
  const text = userText(parts);
  const automation = automationOf(parts);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <MessageAttachments parts={parts} />
      {text && (
        <div className="group flex w-full items-start justify-end gap-1">
          <div className="flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <CopyButton text={text} />
          </div>
          <p className="flex max-w-5/6 items-center gap-1.5 rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {automation && (
              <span className="flex max-w-40 shrink-0">
                <RecordChip type="automation" id={automation.id} label={automation.name} />
              </span>
            )}
            <span className="min-w-0">
              <MessageText text={text} mentions={mentionsOf(parts)} />
            </span>
          </p>
        </div>
      )}
      <ActionValues parts={parts} />
    </div>
  );
};
