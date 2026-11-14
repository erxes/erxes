import {
  type AssistantAttachment,
  AssistantFiles,
  type AssistantSelection,
  AssistantSelections,
} from '@erxes/core-contract';
import { IconFileText } from '@tabler/icons-react';
import type { UIMessage } from 'ai';
import { useTranslation } from 'react-i18next';
import { fileUrl, isImage, sizeLabel, typeLabel } from './attachments';

const CARD =
  'flex h-12 max-w-56 min-w-0 items-center gap-2 rounded-lg border bg-background p-1.5 pr-3 text-xs hover:bg-accent';

const attachmentsOf = (message: UIMessage) => ({
  files: message.parts.flatMap((part) =>
    part.type === 'data-files' ? (AssistantFiles.safeParse(part.data).data?.files ?? []) : [],
  ),
  selections: message.parts.flatMap((part) =>
    part.type === 'data-selections'
      ? (AssistantSelections.safeParse(part.data).data?.selections ?? [])
      : [],
  ),
});

const FileCard = ({ file }: { file: AssistantAttachment }) => (
  <li>
    <a href={fileUrl(file.id)} target="_blank" rel="noreferrer" className={CARD} title={file.name}>
      {isImage(file.contentType) ? (
        <img
          src={fileUrl(file.id)}
          alt=""
          className="size-9 shrink-0 rounded-md border object-cover"
        />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent">
          <IconFileText aria-hidden className="size-4 text-muted-foreground" />
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{file.name}</span>
        <span className="truncate text-muted-foreground">
          {`${typeLabel(file)} · ${sizeLabel(file.size)}`}
        </span>
      </span>
    </a>
  </li>
);

const SelectionCard = ({ selection }: { selection: AssistantSelection }) => {
  const { t } = useTranslation('assistant');

  return (
    <li>
      <a
        href={fileUrl(selection.snapshot)}
        target="_blank"
        rel="noreferrer"
        className={CARD}
        title={selection.title}
      >
        <img
          src={fileUrl(selection.snapshot)}
          alt={t('select.snapshot', 'Snapshot')}
          className="size-9 shrink-0 rounded-md border bg-background object-contain"
        />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{selection.title}</span>
          <span className="truncate text-muted-foreground">
            {t('select.kind', 'Page selection')}
          </span>
        </span>
      </a>
    </li>
  );
};

export const MessageAttachments = ({ message }: { message: UIMessage }) => {
  const { t } = useTranslation('assistant');
  const { files, selections } = attachmentsOf(message);

  if (!files.length && !selections.length) return null;

  return (
    <ul aria-label={t('attach.list', 'Attached')} className="flex flex-wrap justify-end gap-1.5">
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
      {selections.map((selection) => (
        <SelectionCard key={selection.id} selection={selection} />
      ))}
    </ul>
  );
};
