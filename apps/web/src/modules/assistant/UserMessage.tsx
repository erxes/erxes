import { AssistantMentions, type AssistantMessagePart } from '@erxes/core-contract';
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
    </div>
  );
};
