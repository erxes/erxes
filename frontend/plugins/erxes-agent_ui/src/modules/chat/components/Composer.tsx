import { RefObject } from 'react';
import {
  IconLoader2,
  IconPaperclip,
  IconPlayerStopFilled,
  IconSend,
} from '@tabler/icons-react';
import { Button, Textarea, Tooltip } from 'erxes-ui';
import { ReasoningEffort } from '~/modules/chat/types';
import { useAttachments } from '~/modules/chat/hooks/useAttachments';
import { ComposerAttachmentChip } from '~/modules/chat/components/ComposerAttachmentChip';
import { ReasoningEffortControl } from '~/modules/chat/components/ReasoningEffortControl';

type AttachmentsBag = ReturnType<typeof useAttachments>;

export const Composer = ({
  input,
  onInputChange,
  onSend,
  onStop,
  onKeyDown,
  chatLoading,
  attachmentsEnabled,
  attachments,
  agentName,
  reasoningEffort,
  onReasoningEffortChange,
  textareaRef,
  fileInputRef,
}: {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  chatLoading: boolean;
  attachmentsEnabled: boolean;
  attachments: AttachmentsBag;
  agentName: string;
  reasoningEffort?: ReasoningEffort;
  onReasoningEffortChange: (effort?: ReasoningEffort) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
  fileInputRef: RefObject<HTMLInputElement>;
}) => {
  const { pendingAtts, addFiles, removeAttachment, uploadsInFlight, onPaste } =
    attachments;
  return (
  <div className="p-3 pt-1 bg-background">
    <div className="max-w-3xl mx-auto w-full">
      <div
        className={`rounded-2xl border bg-background shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-md ${
          chatLoading ? 'border-primary/30' : 'border-border'
        }`}
      >
        {pendingAtts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
            {pendingAtts.map((att) => (
              <ComposerAttachmentChip
                key={att.id}
                att={att}
                onRemove={() => removeAttachment(att.id)}
              />
            ))}
          </div>
        )}
        <div className="flex gap-1.5 items-end p-2">
          {attachmentsEnabled && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-9 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={chatLoading || pendingAtts.length >= 10}
                    >
                      <IconPaperclip className="size-4" />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    Attach files (images, PDF, Excel, Word, …)
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            </>
          )}
          <ReasoningEffortControl
            value={reasoningEffort}
            onChange={onReasoningEffortChange}
            disabled={chatLoading}
          />
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onInputChange(e.target.value)
            }
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            placeholder={`Message ${agentName}…`}
            rows={1}
            className="ea-composer-textarea flex-1 min-h-9 max-h-40 resize-none py-2 bg-transparent"
          />
          {chatLoading ? (
            <Tooltip.Provider>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-9 shrink-0 border-primary/40 text-primary hover:bg-primary/8 transition-all"
                    onClick={onStop}
                  >
                    <IconPlayerStopFilled className="size-4" />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Stop generating (Esc)</Tooltip.Content>
              </Tooltip>
            </Tooltip.Provider>
          ) : (
            <Button
              size="icon"
              className="size-9 shrink-0 transition-transform duration-150 hover:scale-105 active:scale-95 disabled:scale-100"
              onClick={onSend}
              disabled={!input.trim() || uploadsInFlight}
            >
              {uploadsInFlight ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconSend className="size-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1.5 pl-1 text-center">
        Enter to send · Shift+Enter for new line · Esc to stop
        {attachmentsEnabled && ' · drop or paste files to attach'}
      </p>
    </div>
  </div>
  );
};
