import {
  IconAlertCircle,
  IconChevronDown,
  IconChevronUp,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { Button, Collapsible } from 'erxes-ui';
import { useState } from 'react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  errorCode?: string;
  errorDetails?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorState({
  title = 'An error occurred',
  description,
  errorCode = 'ERR_WORKFLOW_EXECUTION',
  errorDetails = 'The workflow execution failed because one of the required parameters is missing or invalid. Please check your configuration and try again.',
  onRetry,
  onDismiss,
}: ErrorStateProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4 rounded-lg border border-red-200 bg-background max-w-full overflow-auto">
      <div className="border-red-500/50 flex flex-row items-center gap-2">
        <IconAlertCircle className="h-5 w-5" />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h4 className="text-red-700 font-medium">{title}</h4>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full -mt-1 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                onClick={onDismiss}
              >
                <IconX className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </div>
          {description && (
            <span className="text-red-700/90 mt-1">{description}</span>
          )}
        </div>
      </div>

      <div className="mt-3 text-sm">
        <div className="flex items-center text-gray-500 mb-1">
          <span className="font-mono text-xs bg-red-50 px-2 py-0.5 rounded border border-red-100">
            {errorCode}
          </span>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
          <div className="flex items-center gap-1">
            <Collapsible.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-gray-500 hover:text-gray-700 hover:bg-transparent"
                data-collapsible-trigger="true"
              >
                <span className="text-xs underline underline-offset-2">
                  {isOpen ? 'Hide details' : 'Show details'}
                </span>
                {isOpen ? (
                  <IconChevronUp className="h-3 w-3 ml-1" />
                ) : (
                  <IconChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>
            </Collapsible.Trigger>
          </div>
          <Collapsible.Content className="mt-2 ">
            <div className="bg-gray-50 p-3 rounded border border-gray-100 text-xs text-gray-600 font-mono whitespace-pre-wrap w-auto overflow-auto">
              {errorDetails}
            </div>
          </Collapsible.Content>
        </Collapsible>
      </div>

      {onRetry && (
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-sm border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            onClick={onRetry}
          >
            <IconRefresh className="h-3.5 w-3.5 mr-1.5" />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
