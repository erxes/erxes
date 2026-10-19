import { memo, useMemo } from 'react';
import { IconFileDescription, IconLoader2 } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

import { ArtifactCard } from './ArtifactCard';
import { splitArtifacts } from './parseArtifacts';
import { Markdown } from '../components/Markdown';

interface IMessageContentProps {
  content: string;
  isStreaming?: boolean;
  retryDisabled?: boolean;
  onRetryArtifact?: (title: string) => void;
}

const MessageContentBase = ({
  content,
  isStreaming = false,
  retryDisabled = false,
  onRetryArtifact,
}: IMessageContentProps) => {
  const segments = useMemo(() => splitArtifacts(content), [content]);
  const only = segments[0];

  if (segments.length === 1 && only?.kind === 'text') {
    return <Markdown content={only.text} references />;
  }

  return (
    <div className="flex flex-col gap-3">
      {segments.map((segment, index) =>
        segment.kind === 'text' ? (
          segment.text ? (
            <Markdown key={index} content={segment.text} references />
          ) : null
        ) : !segment.artifact.complete ? (
          <div
            key={index}
            className="flex min-h-32 items-center gap-4 rounded-xl bg-muted/30 px-5 py-6"
            role="status"
            aria-live="polite"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
              {isStreaming ? (
                <IconLoader2 className="size-5 motion-safe:animate-spin" />
              ) : (
                <IconFileDescription className="size-5" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-medium">
                {segment.artifact.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {isStreaming
                  ? 'Creating your artifact… The preview will appear here.'
                  : 'Generation stopped before this artifact was complete.'}
              </p>
              {!isStreaming && onRetryArtifact && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-2 mt-1 h-7 text-xs"
                  disabled={retryDisabled}
                  onClick={() => onRetryArtifact(segment.artifact.title)}
                >
                  Generate again
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ArtifactCard key={index} artifact={segment.artifact} />
        ),
      )}
    </div>
  );
};

export const MessageContent = memo(MessageContentBase);
