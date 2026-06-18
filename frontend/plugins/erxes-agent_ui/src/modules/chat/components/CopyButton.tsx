import { useState } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { Tooltip } from 'erxes-ui';

// Icon-only copy affordance with a transient "Copied!" state. Used in code
// blocks and the assistant message action row.
export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={handleCopy}
            className="size-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <IconCheck className="size-3.5 text-green-600" />
            ) : (
              <IconCopy className="size-3.5" />
            )}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content>{copied ? 'Copied!' : 'Copy'}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
