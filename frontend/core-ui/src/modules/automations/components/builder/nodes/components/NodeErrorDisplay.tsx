import { IconAlertCircle, IconX } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('automations');

  return (
    <div className={cn('relative', className)}>
      {/* Error indicator */}
      <div
        className="flex items-center gap-1 p-2 bg-destructive/5 border border-destructive/20 rounded text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        title={error}
      >
        <IconAlertCircle className="size-3" />
        <span className="text-xs font-medium">{t('configuration-error')}</span>
        <span className="text-xs text-destructive ml-auto">
          {isExpanded ? '−' : '+'}
        </span>
      </div>

      {/* Expanded error message */}
      {isExpanded && (
        <div className="mt-2 p-2 bg-destructive/5 border border-destructive/20 rounded">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs text-destructive leading-relaxed">
                {error}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {onClearError && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-destructive/20"
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
      <IconAlertCircle className="size-4 text-destructive" />
    </div>
  );
};
