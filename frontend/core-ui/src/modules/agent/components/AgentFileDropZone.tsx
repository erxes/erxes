import { IconFileUpload } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { useCallback, type ReactNode, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { AGENTS_FILE_MAX_PER_TURN } from '../agentsFiles';
import { useAgentFileDrop } from '../hooks/useAgentFileDrop';
import { AGENTS_ACCEPTED_TYPES_LABEL } from '../utils/agentAttachments';
import type { IComposerAttachHandle } from './Composer';

export interface IAgentFileDropZoneProps {
  attachRef: RefObject<IComposerAttachHandle>;
  className?: string;
  children: ReactNode;
}

/** The whole Assistant panel accepts dropped files for the current composer. */
export const AgentFileDropZone = ({
  attachRef,
  className,
  children,
}: IAgentFileDropZoneProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const availability = useCallback(
    () => attachRef.current?.availability() ?? 'disabled',
    [attachRef],
  );
  const onFiles = useCallback(
    (files: File[]) => attachRef.current?.attachFiles(files),
    [attachRef],
  );
  const { visible, full, count, rootProps } = useAgentFileDrop({
    availability,
    onFiles,
  });

  // The accepted-types list is technical and stays in English.
  let detail =
    AGENTS_ACCEPTED_TYPES_LABEL.charAt(0).toUpperCase() +
    AGENTS_ACCEPTED_TYPES_LABEL.slice(1);
  if (full) {
    detail = t('drop-limit-detail', {
      max: AGENTS_FILE_MAX_PER_TURN,
      defaultValue:
        'Remove an attachment first. Up to {{max}} files per message.',
    });
  } else if (count) {
    detail = t('drop-file-count', {
      count,
      defaultValue: '{{count}} files',
    });
  }

  return (
    <div className={cn('relative', className)} {...rootProps}>
      {children}
      <div
        aria-hidden={!visible}
        data-state={visible ? 'open' : 'closed'}
        className={cn(
          'pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-[2px] transition-opacity duration-200 ease-out motion-reduce:transition-none',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div
          className={cn(
            'flex size-full max-h-80 max-w-md flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center transition-[transform,border-color,background-color] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none',
            full
              ? 'border-muted-foreground/40 bg-muted/40'
              : 'border-primary/50 bg-primary/5',
            visible ? 'scale-100' : 'scale-95',
          )}
        >
          <span
            className={cn(
              'flex size-12 items-center justify-center rounded-full',
              full
                ? 'bg-muted text-muted-foreground'
                : 'bg-primary/10 text-primary',
            )}
          >
            <IconFileUpload className="size-6" aria-hidden />
          </span>
          <p className="text-sm font-medium">
            {full
              ? t('drop-limit-title', 'Attachment limit reached')
              : t('drop-title', 'Drop files to attach')}
          </p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
      <span role="status" className="sr-only">
        {visible && !full
          ? t('drop-status', 'Drop files to attach them to your message')
          : ''}
      </span>
    </div>
  );
};
