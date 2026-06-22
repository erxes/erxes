import { useState } from 'react';
import {
  IconAlertCircle,
  IconCheck,
  IconChevronRight,
  IconTool,
} from '@tabler/icons-react';
import { ToolPartView } from '~/modules/chat/lib/uiParts';
import { formatJson } from '~/modules/chat/lib/markdown';

export const ToolCallRow = ({
  call,
  streaming,
}: {
  call: ToolPartView;
  streaming?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const pending = call.pending && streaming;
  const settled = call.state === 'output-available' || call.state === 'output-error';
  const result = call.isError ? call.errorText : call.output;

  return (
    <div
      className={`ea-pop rounded-xl border overflow-hidden transition-colors ${
        pending
          ? 'border-primary/30 bg-primary/4'
          : 'border-border/60 bg-background/40 hover:border-border'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors hover:bg-accent/40"
      >
        <IconChevronRight
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          }`}
        />
        <IconTool className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-mono truncate flex-1 text-left">
          {call.toolName}
        </span>
        {pending ? (
          <span className="ea-tool-running size-2 shrink-0 rounded-full" />
        ) : call.isError ? (
          <IconAlertCircle className="size-3.5 shrink-0 text-destructive" />
        ) : settled ? (
          <IconCheck className="size-3.5 shrink-0 text-success" />
        ) : null}
      </button>
      {expanded && (
        <div className="ea-expand px-3 pb-2.5 space-y-2">
          {call.input !== undefined && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Request
              </p>
              <pre className="text-[11px] font-mono bg-muted/40 rounded-md p-2 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                {formatJson(call.input)}
              </pre>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Response
            </p>
            <pre className="text-[11px] font-mono bg-muted/40 rounded-md p-2 overflow-auto max-h-60 whitespace-pre-wrap break-all">
              {pending ? 'Running…' : formatJson(result) || '—'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
