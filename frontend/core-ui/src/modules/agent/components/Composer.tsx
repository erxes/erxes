import {
  IconArrowUp,
  IconPaperclip,
  IconPlayerStop,
  IconX,
} from '@tabler/icons-react';
import { Button, Tooltip } from 'erxes-ui';
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {
  AGENTS_FILE_MAX_BYTES,
  AGENTS_FILE_MAX_PER_TURN,
  AGENTS_FILE_ONLY_TEXT,
  AGENTS_FILE_TEXT_MAX_BYTES,
  AGENTS_FILE_TEXT_TOTAL_MAX_BYTES,
  isAgentsTextMimeType,
  mimeFromFile,
  type IAgentsFileMeta,
} from '../agentsFiles';
import { useTranslation } from 'react-i18next';

import { uploadAgentsFile } from '../uploadAgentsFile';
import { ChatInput } from './ChatInput';

export interface IComposerAttachment {
  localId: string;
  name: string;
  mimeType: string;
  size: number;
  status: 'uploading' | 'ready' | 'error';
  error?: string;
  file?: IAgentsFileMeta;
}

export interface IComposerProps {
  status: string;
  disabled: boolean;
  /** 'large' renders the taller page empty-state composer. */
  size?: 'default' | 'large';
  draftScope?: string;
  onSend: (text: string, files: IAgentsFileMeta[]) => void;
  onStop: () => void;
  pickers?: ReactNode;
  /** Optional page-context chip row above the textarea (side panel). */
  contextRow?: ReactNode;
}

export const Composer = ({
  status,
  disabled,
  size = 'default',
  draftScope,
  onSend,
  onStop,
  pickers,
  contextRow,
}: IComposerProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<IComposerAttachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadsRef = useRef(new Map<string, AbortController>());
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;

  useEffect(() => {
    const uploads = uploadsRef.current;
    setAttachments([]);
    setText('');

    return () => {
      uploads.forEach((controller) => controller.abort());
      uploads.clear();
    };
  }, [draftScope]);

  const isStreaming = status === 'submitted' || status === 'streaming';
  const trimmed = text.trim();
  const hasPending = attachments.some((item) => item.status === 'uploading');
  const hasError = attachments.some((item) => item.status === 'error');
  const readyFiles = attachments
    .map((item) => item.file)
    .filter((file): file is IAgentsFileMeta => file !== undefined);
  const canSend =
    !disabled &&
    !isStreaming &&
    !hasPending &&
    !hasError &&
    (trimmed.length > 0 || readyFiles.length > 0);

  const send = () => {
    if (!canSend) {
      return;
    }

    onSend(trimmed || AGENTS_FILE_ONLY_TEXT, readyFiles);
    attachmentsRef.current = [];
    setText('');
    setAttachments([]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      send();
    }
  };

  const startUploads = (fileList: FileList | null) => {
    if (disabled || isStreaming || !fileList || fileList.length === 0) {
      return;
    }

    const remaining = AGENTS_FILE_MAX_PER_TURN - attachments.length;
    const picked = Array.from(fileList).slice(0, Math.max(0, remaining));

    if (picked.length === 0) {
      return;
    }

    const readyTextBytes = attachments.reduce(
      (total, item) =>
        total +
        (item.status !== 'error' && isAgentsTextMimeType(item.mimeType)
          ? item.size
          : 0),
      0,
    );
    let incomingTextBytes = 0;
    const drafts: IComposerAttachment[] = picked.map((file) => {
      const mimeType = mimeFromFile(file);
      const textFile = isAgentsTextMimeType(mimeType);
      let error: string | undefined;
      if (file.size > AGENTS_FILE_MAX_BYTES) {
        error = 'File is too large.';
      } else if (textFile && file.size > AGENTS_FILE_TEXT_MAX_BYTES) {
        error =
          'Text attachments must be at most 64 KiB each. Split the file and retry.';
      } else if (
        textFile &&
        readyTextBytes + incomingTextBytes + file.size >
          AGENTS_FILE_TEXT_TOTAL_MAX_BYTES
      ) {
        error =
          'Text attachments must total at most 128 KiB per message. Send fewer files.';
      } else if (textFile) {
        incomingTextBytes += file.size;
      }
      return {
        localId: crypto.randomUUID(),
        name: file.name,
        mimeType,
        size: file.size,
        status: error ? 'error' : 'uploading',
        error,
      };
    });

    setAttachments((current) => [...current, ...drafts]);

    picked.forEach((file, index) => {
      const localId = drafts[index].localId;
      if (drafts[index].status === 'error') {
        return;
      }

      const controller = new AbortController();
      uploadsRef.current.set(localId, controller);

      void uploadAgentsFile(file, { signal: controller.signal })
        .then((uploaded) => {
          if (controller.signal.aborted) {
            return;
          }
          setAttachments((current) =>
            current.map((item) =>
              item.localId === localId
                ? { ...item, status: 'ready', file: uploaded }
                : item,
            ),
          );
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }
          setAttachments((current) =>
            current.map((item) =>
              item.localId === localId
                ? {
                    ...item,
                    status: 'error',
                    error:
                      error instanceof Error ? error.message : 'Upload failed.',
                  }
                : item,
            ),
          );
        })
        .finally(() => uploadsRef.current.delete(localId));
    });
  };

  const removeAttachment = (localId: string) => {
    uploadsRef.current.get(localId)?.abort();
    uploadsRef.current.delete(localId);
    setAttachments((current) =>
      current.filter((entry) => entry.localId !== localId),
    );
  };

  return (
    <div className="agent-composer rounded-[22px] border bg-card shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_8%,transparent)]">
      {contextRow && (
        <div className="flex flex-wrap items-center gap-1.5 px-3.5 pt-3 sm:px-4">
          {contextRow}
        </div>
      )}
      {attachments.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 px-3.5 pt-3 sm:px-4">
          {attachments.map((item) => (
            <li
              key={item.localId}
              className="flex max-w-full items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[11px]"
            >
              <span className="truncate">{item.name}</span>
              {item.status === 'uploading' && (
                <span className="text-muted-foreground">Uploading…</span>
              )}
              {item.status === 'error' && (
                <span className="text-destructive">{item.error}</span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-5 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                onClick={() => removeAttachment(item.localId)}
                aria-label={`Remove ${item.name}`}
              >
                <IconX className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="px-3.5 pt-3 sm:px-4">
        <ChatInput
          value={text}
          onChange={setText}
          onKeyDown={handleKeyDown}
          placeholder={t('composer-placeholder', 'Ask anything…')}
          disabled={disabled}
          ariaLabel="Message"
          minHeight={size === 'large' ? 66 : undefined}
          className={size === 'large' ? 'text-[15px] leading-6' : undefined}
        />
      </div>
      <div className="flex items-center gap-2 px-2.5 pb-2.5 pt-1.5">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept=".png,.jpg,.jpeg,.webp,.gif,.txt,.md,.markdown,.csv,.json,.pdf,.docx,.xlsx"
          aria-label="Choose attachments"
          onChange={(event) => {
            startUploads(event.target.files);
            event.target.value = '';
          }}
        />
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-full"
                disabled={
                  disabled ||
                  isStreaming ||
                  attachments.length >= AGENTS_FILE_MAX_PER_TURN
                }
                onClick={() => inputRef.current?.click()}
                aria-label="Attach files"
              >
                <IconPaperclip className="size-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content side="top" className="max-w-xs">
              Up to 5 files, 10 MiB each. AI reads CSV, TXT, Markdown and JSON
              (64 KiB each, 128 KiB total). Other formats are download-only.
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
        {pickers && (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {pickers}
          </div>
        )}
        {isStreaming ? (
          <Button
            variant="outline"
            size="icon"
            className={`agent-send size-8 shrink-0 rounded-full ${
              pickers ? '' : 'ml-auto'
            }`}
            onClick={onStop}
            aria-label="Stop generating"
          >
            <IconPlayerStop className="size-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            className={`agent-send size-8 shrink-0 rounded-full ${
              pickers ? '' : 'ml-auto'
            }`}
            onClick={send}
            disabled={!canSend}
            aria-label="Send message"
          >
            <IconArrowUp className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
