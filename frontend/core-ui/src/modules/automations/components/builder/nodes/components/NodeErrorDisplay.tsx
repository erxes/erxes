import { IconAlertCircle, IconX } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useState } from 'react';

interface NodeErrorDisplayProps {
  error: string;
  nodeId: string;
  onClearError?: (nodeId: string) => void;
  className?: string;
}

export const NodeErrorDisplay = ({
  error,
  nodeId,
  onClearError,
  className,
}: NodeErrorDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn('relative', className)}>
      {/* Error indicator */}
      <div
        className="flex items-center gap-1 p-2 bg-red-50 border border-red-200 rounded text-red-700 cursor-pointer hover:bg-red-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        title={error}
      >
        <IconAlertCircle className="size-3" />
        <span className="text-xs font-medium">Configuration Error</span>
        <span className="text-xs text-red-500 ml-auto">
          {isExpanded ? '−' : '+'}
        </span>
      </div>

      {/* Expanded error message */}
      {isExpanded && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
            <div className="flex items-center gap-1">
              {onClearError && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-red-200"
                  onClick={() => onClearError(nodeId)}
                >
                  <IconX className="size-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact error indicator for small spaces
export const NodeErrorIndicator = ({
  error,
  className,
}: {
  error: string;
  className?: string;
}) => {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      title={error}
    >
      <IconAlertCircle className="size-4 text-red-500" />
    </div>
  );
};
