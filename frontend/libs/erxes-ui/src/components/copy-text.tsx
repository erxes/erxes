import { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { cn } from '../lib';
import { Tooltip } from './tooltip';

interface CopyTextProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const CopyText = ({ value, children, className }: CopyTextProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write failed
    }
  };

  return (
    <Tooltip.Provider>
      <Tooltip open={copied ? false : undefined}>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'inline-flex items-center gap-1 transition-colors',
              className,
            )}
          >
            {copied ? (
              <span className="flex items-center gap-1 text-success">
                <IconCheck className="size-4 shrink-0" />
                Copied!
              </span>
            ) : (
              children
            )}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content>Click to copy</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
