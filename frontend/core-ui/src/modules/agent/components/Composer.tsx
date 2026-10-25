import {
  IconPaperclip,
  IconPlayerStop,
  IconPointer,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { Button, Spinner, Tooltip, toast } from 'erxes-ui';
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';

import {
  AGENTS_FILE_ACCEPT,
  AGENTS_FILE_MAX_PER_TURN,
  AGENTS_FILE_ONLY_TEXT,
  isAgentsTextMimeType,
  type IAgentsFileMeta,
} from '../agentsFiles';
import { useTranslation } from 'react-i18next';

import { uploadAgentsFile } from '../uploadAgentsFile';
import { useAgentMentions } from '../hooks/useAgentMentions';
import {
  describeAgentsAttachmentRejections,
  filesFromClipboard,
  planAgentsAttachments,
} from '../utils/agentAttachments';
import type { TAgentsAttachAvailability } from '../utils/fileDrag';
import { resizeAgentsImage } from '../utils/resizeAgentsImage';
import { AgentAttachmentCard } from './AgentAttachmentCard';
import { AgentMentionInput } from './AgentMentionInput';
import { PageElementPicker } from './PageElementPicker';
import type { IPageSelection } from '../utils/pageSelection';
import {
  AGENTS_PAGE_SELECTION_MAX_PER_TURN,
  type IAgentPageSelectionContext,
} from '../pageSelections';

export interface IComposerAttachment {
  localId: string;
  name: string;
  mimeType: string;
  size: number;
  status: 'uploading' | 'ready' | 'error';
  error?: string;
  file?: IAgentsFileMeta;
  context?: IAgentPageSelectionContext;
  selection?: IPageSelection;
  previewUrl?: string;
  /** Original file, kept so a failed upload can be retried. */
  source?: File;
  resize?: boolean;
}

/** Lets the panel-wide drop zone attach files through this composer. */
export interface IComposerAttachHandle {
  availability: () => TAgentsAttachAvailability;
  attachFiles: (files: File[]) => void;
}

export interface IComposerProps {
  status: string;
  disabled: boolean;
  /** 'large' renders the taller page empty-state composer. */
  size?: 'default' | 'large';
  draftScope?: string;
  onSend: (
    text: string,
    files: IAgentsFileMeta[],
    selections?: IAgentPageSelectionContext[],
  ) => void;
  onStop: () => void;
  pickers?: ReactNode;
  /** Optional page-context chip row above the textarea (side panel). */
  contextRow?: ReactNode;
  attachRef?: Ref<IComposerAttachHandle>;
}

const countFileSlots = (items: IComposerAttachment[]): number =>
  items.reduce((total, item) => total + (item.selection ? 0 : 1), 0);

export const Composer = ({
  status,
  disabled,
  size = 'default',
  draftScope,
  onSend,
  onStop,
  pickers,
  contextRow,
  attachRef,
}: IComposerProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const [text, setText] = useState('');
  const mentions = useAgentMentions(text);
  const [selecting, setSelecting] = useState(false);
  const [attachments, setAttachments] = useState<IComposerAttachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadsRef = useRef(new Map<string, AbortController>());
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;

  const releasePreviews = () => {
    attachmentsRef.current.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  };

  useEffect(() => {
    const uploads = uploadsRef.current;
    releasePreviews();
    attachmentsRef.current = [];
    setAttachments([]);
    setText('');
    setSelecting(false);

    return () => {
      uploads.forEach((controller) => controller.abort());
      uploads.clear();
      releasePreviews();
    };
  }, [draftScope]);

  const isStreaming = status === 'submitted' || status === 'streaming';
  const usedSlots = countFileSlots(attachments);
  useEffect(() => {
    if (disabled || isStreaming) setSelecting(false);
  }, [disabled, isStreaming]);
  // Mentions are sent as `[[type:id:label]]` tokens (see agentMentions.ts).
  const trimmed = mentions.serialize(text).trim();
  const hasPending = attachments.some((item) => item.status === 'uploading');
  const hasError = attachments.some((item) => item.status === 'error');
  const readyFiles = attachments.flatMap((item) =>
    item.file ? [item.file] : [],
  );
  const selectedContexts = attachments.flatMap((item) =>
    item.context ? [item.context] : [],
  );
  const selectionCount = attachments.filter((item) => item.selection).length;
  const canSend =
    !disabled &&
    !isStreaming &&
    !hasPending &&
    !hasError &&
    (trimmed.length > 0 ||
      readyFiles.length > 0 ||
      selectedContexts.length > 0);

  const send = () => {
    if (!canSend) {
      return;
    }

    const prompt =
      trimmed ||
      (selectedContexts.length
        ? 'About this page selection'
        : AGENTS_FILE_ONLY_TEXT);
    if (selectedContexts.length) onSend(prompt, readyFiles, selectedContexts);
    else onSend(prompt, readyFiles);
    releasePreviews();
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

  const patchAttachment = (
    localId: string,
    patch: Partial<IComposerAttachment>,
  ) =>
    setAttachments((current) =>
      current.map((item) =>
        item.localId === localId ? { ...item, ...patch } : item,
      ),
    );

  const uploadFile = (localId: string, file: File, resize: boolean) => {
    const controller = new AbortController();
    uploadsRef.current.set(localId, controller);
    const { signal } = controller;
    const request = resize
      ? resizeAgentsImage(file).then((prepared) =>
          signal.aborted
            ? Promise.reject(new Error('Upload cancelled.'))
            : uploadAgentsFile(prepared, { signal }),
        )
      : uploadAgentsFile(file, { signal });

    void request
      .then((uploaded) => {
        if (signal.aborted) {
          return;
        }
        patchAttachment(localId, {
          name: uploaded.name,
          mimeType: uploaded.type,
          size: uploaded.size,
          status: 'ready',
          error: undefined,
          file: uploaded,
        });
      })
      .catch((error: unknown) => {
        if (signal.aborted) {
          return;
        }
        patchAttachment(localId, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed.',
        });
      })
      .finally(() => {
        if (uploadsRef.current.get(localId) === controller)
          uploadsRef.current.delete(localId);
      });
  };

  const canAttach = !disabled && !isStreaming;

  const attachFiles = (files: File[]) => {
    if (!canAttach || files.length === 0) {
      return;
    }

    const textBytesInUse = attachmentsRef.current.reduce(
      (total, item) =>
        total +
        (item.status !== 'error' && isAgentsTextMimeType(item.mimeType)
          ? item.size
          : 0),
      0,
    );
    const plan = planAgentsAttachments(files, {
      remainingSlots:
        AGENTS_FILE_MAX_PER_TURN - countFileSlots(attachmentsRef.current),
      textBytesInUse,
    });
    const rejection = describeAgentsAttachmentRejections(plan);
    if (rejection) {
      toast({
        title:
          plan.accepted.length > 0
            ? 'Some files were not attached'
            : 'Files not attached',
        description: rejection,
        variant: 'destructive',
      });
    }
    if (plan.accepted.length === 0) {
      return;
    }

    const drafts: IComposerAttachment[] = plan.accepted.map(
      ({ file, mimeType, error, resize }) => ({
        localId: crypto.randomUUID(),
        name: file.name,
        mimeType,
        size: file.size,
        status: error ? 'error' : 'uploading',
        error,
        source: error ? undefined : file,
        resize,
        previewUrl: mimeType.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
      }),
    );
    // Keep the ref current so a second drop in the same tick sees these slots.
    attachmentsRef.current = [...attachmentsRef.current, ...drafts];
    setAttachments((current) => [...current, ...drafts]);

    drafts.forEach((draft) => {
      if (draft.source) {
        uploadFile(draft.localId, draft.source, draft.resize === true);
      }
    });
  };

  const retryUpload = (item: IComposerAttachment) => {
    if (!item.source || !canAttach) return;
    patchAttachment(item.localId, { status: 'uploading', error: undefined });
    uploadFile(item.localId, item.source, item.resize === true);
  };

  const availability = (): TAgentsAttachAvailability => {
    if (!canAttach) return 'disabled';
    return countFileSlots(attachmentsRef.current) >= AGENTS_FILE_MAX_PER_TURN
      ? 'full'
      : 'ready';
  };

  useImperativeHandle(attachRef, () => ({ availability, attachFiles }));

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = filesFromClipboard(event.clipboardData);
    if (files.length === 0) {
      return;
    }
    event.preventDefault();
    if (!canAttach) {
      toast({
        title: 'Files not attached',
        description: 'Wait for the current response to finish, then paste again.',
      });
      return;
    }
    attachFiles(files);
  };

  const uploadSelection = (item: IComposerAttachment) => {
    const selection = item.selection;
    if (!selection) return;
    const controller = new AbortController();
    uploadsRef.current.set(item.localId, controller);
    patchAttachment(item.localId, { status: 'uploading', error: undefined });
    const image = new File(
      [selection.image],
      `selection-snapshot-${item.localId}.png`,
      { type: 'image/png' },
    );
    void uploadAgentsFile(image, { signal: controller.signal })
      .then((snapshot) => {
        if (!controller.signal.aborted)
          patchAttachment(item.localId, {
            status: 'ready',
            context: {
              id: item.localId,
              title: selection.title,
              path: selection.path.slice(0, 200),
              frame: selection.frame?.slice(0, 80) || undefined,
              text: selection.text,
              width: selection.width,
              height: selection.height,
              snapshot: {
                url: snapshot.url,
                type: 'image/png',
                size: snapshot.size,
              },
            },
          });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          patchAttachment(item.localId, {
            status: 'error',
            error:
              error instanceof Error
                ? error.message
                : 'Could not attach selection.',
          });
      })
      .finally(() => {
        if (uploadsRef.current.get(item.localId) === controller)
          uploadsRef.current.delete(item.localId);
      });
  };

  const attachSelection = (selection: IPageSelection) => {
    setSelecting(false);
    const localId = crypto.randomUUID();
    const item: IComposerAttachment = {
      localId,
      name: selection.title,
      mimeType: 'image/png',
      size: selection.image.size,
      status: 'uploading',
      selection,
      previewUrl: URL.createObjectURL(selection.image),
    };
    setAttachments((current) => [...current, item]);
    uploadSelection(item);
    requestAnimationFrame(() =>
      composerRef.current?.querySelector('textarea')?.focus(),
    );
  };
  const composerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = composerRef.current;
    if (!selecting || !node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (!node.getClientRects().length) setSelecting(false);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [selecting]);

  const removeAttachment = (localId: string) => {
    uploadsRef.current.get(localId)?.abort();
    uploadsRef.current.delete(localId);
    const item = attachmentsRef.current.find(
      (entry) => entry.localId === localId,
    );
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setAttachments((current) =>
      current.filter((entry) => entry.localId !== localId),
    );
  };

  return (
    <div
      ref={composerRef}
      data-agent-selection-ignore=""
      className="agent-composer @container rounded-[22px] border bg-card shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_8%,transparent)]"
    >
      {selecting && (
        <PageElementPicker
          onSelect={attachSelection}
          onCancel={() => setSelecting(false)}
        />
      )}
      {contextRow && (
        <div className="flex flex-wrap items-center gap-1.5 px-3.5 pt-3 sm:px-4">
          {contextRow}
        </div>
      )}
      {attachments.length > 0 && (
        <ul
          aria-label="Attachments"
          className="flex flex-wrap gap-1.5 px-3.5 pt-3 sm:px-4"
        >
          {attachments.map((item) =>
            item.selection ? (
              <li
                key={item.localId}
                className="agent-chip-enter flex w-full min-w-0 items-center gap-3 rounded-xl border bg-muted/30 p-2"
              >
                <div className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background">
                  <img
                    src={item.previewUrl}
                    alt={`Selected ${item.name}`}
                    className="h-full w-full object-contain"
                  />
                  {item.status === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                      <Spinner className="size-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-medium"
                    title={item.name}
                  >
                    {item.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.selection.frame || item.selection.path} ·{' '}
                    {item.selection.width} × {item.selection.height}
                  </p>
                  {item.status === 'uploading' && (
                    <p
                      role="status"
                      className="text-[11px] text-muted-foreground"
                    >
                      Attaching selection…
                    </p>
                  )}
                  {item.status === 'ready' && (
                    <p className="text-[11px] text-muted-foreground">
                      Page selection
                    </p>
                  )}
                  {item.status === 'error' && (
                    <p role="alert" className="text-[11px] text-destructive">
                      {item.error}
                    </p>
                  )}
                </div>
                {item.status === 'error' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => uploadSelection(item)}
                  >
                    Retry
                  </Button>
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
            ) : (
              <li
                key={item.localId}
                className="agent-chip-enter min-w-0 max-w-full"
              >
                <AgentAttachmentCard
                  name={item.name}
                  mimeType={item.mimeType}
                  size={item.size}
                  previewUrl={item.previewUrl}
                  status={item.status}
                  error={item.error}
                  onRetry={
                    item.source && canAttach
                      ? () => retryUpload(item)
                      : undefined
                  }
                  onRemove={() => removeAttachment(item.localId)}
                />
              </li>
            ),
          )}
        </ul>
      )}
      <div className="px-3.5 pt-3 sm:px-4">
        <AgentMentionInput
          mentions={mentions}
          value={text}
          onChange={setText}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={t('composer-placeholder', 'Ask anything, @ to mention')}
          disabled={disabled}
          ariaLabel="Message"
          minHeight={size === 'large' ? 66 : undefined}
          className={size === 'large' ? 'text-[15px] leading-6' : undefined}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 px-2.5 pb-2.5 pt-1.5">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept={AGENTS_FILE_ACCEPT}
          aria-label="Choose attachments"
          onChange={(event) => {
            attachFiles(Array.from(event.target.files ?? []));
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
                  usedSlots >= AGENTS_FILE_MAX_PER_TURN
                }
                onClick={() => inputRef.current?.click()}
                aria-label="Attach files"
              >
                <IconPaperclip className="size-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content side="top" className="max-w-xs">
              Up to 5 files, 10 MiB each. Drop or paste them anywhere in the
              chat. The AI reads images, PDF, Word, Excel, PowerPoint,
              OpenDocument and RTF. Large images are resized. CSV, TXT, Markdown
              and JSON: 64 KiB each, 128 KiB total.
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
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
                  selectionCount >= AGENTS_PAGE_SELECTION_MAX_PER_TURN
                }
                onClick={() => setSelecting(true)}
                aria-label="Select on page"
                aria-pressed={selecting}
              >
                <IconPointer className="size-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content side="top">
              Select an element to ask about it
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
        {pickers && (
          <div className="order-first flex w-full min-w-0 flex-none items-center gap-2 @sm:order-none @sm:w-auto @sm:flex-1">
            {pickers}
          </div>
        )}
        {isStreaming ? (
          <Button
            variant="ghost"
            size="icon"
            className={`agent-send size-8 shrink-0 rounded-full border-0 bg-transparent text-foreground shadow-none hover:bg-transparent focus-visible:outline-current ${
              pickers ? 'ml-auto @sm:ml-0' : 'ml-auto'
            }`}
            onClick={onStop}
            aria-label="Stop generating"
          >
            <IconPlayerStop className="size-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className={`agent-send size-8 shrink-0 rounded-full border-0 bg-transparent text-foreground shadow-none hover:bg-transparent focus-visible:outline-current ${
              pickers ? 'ml-auto @sm:ml-0' : 'ml-auto'
            }`}
            onClick={send}
            disabled={!canSend}
            aria-label="Send message"
          >
            <IconSend className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
