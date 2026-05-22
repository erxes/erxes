import {
  Input,
  PopoverScoped,
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
} from 'erxes-ui';
import React, { useEffect, useState } from 'react';

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export const ConfidenceScoreBar = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const v = clamp(Number.isFinite(value) ? value : 0);
  return (
    <div
      className={'flex items-center gap-2 ' + (className ?? '')}
      data-testid="confidence-score-bar"
      data-value={v}
    >
      <div className="w-12 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${v}%` }}
        />
      </div>
      <span className="font-medium tabular-nums text-sm">{v}%</span>
    </div>
  );
};

const SelectConfidenceScoreContent = ({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (value: number) => void;
}) => {
  const [draft, setDraft] = useState<string>(String(clamp(value)));

  useEffect(() => {
    setDraft(String(clamp(value)));
  }, [value]);

  const commit = () => {
    const next = clamp(Number(draft));
    if (next !== clamp(value)) onCommit(next);
  };

  return (
    <div className="p-2 flex flex-col gap-2 w-48">
      <Input
        type="number"
        min={0}
        max={100}
        step={1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        autoFocus
        data-testid="confidence-score-input"
      />
      <ConfidenceScoreBar value={Number(draft) || 0} />
    </div>
  );
};

const SelectConfidenceScoreRoot = ({
  value = 0,
  onValueChange,
  scope,
  variant,
}: {
  value?: number;
  onValueChange: (value: number) => void;
  scope?: string;
  variant: `${SelectTriggerVariant}`;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <SelectTriggerOperation variant={variant}>
        <ConfidenceScoreBar value={value} />
      </SelectTriggerOperation>
      <SelectOperationContent variant={variant}>
        <SelectConfidenceScoreContent
          value={value}
          onCommit={(v) => {
            setOpen(false);
            onValueChange(v);
          }}
        />
      </SelectOperationContent>
    </PopoverScoped>
  );
};

const SelectConfidenceScoreFormItem = ({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: number) => void;
}) => {
  const [draft, setDraft] = useState<string>(String(clamp(value)));

  useEffect(() => {
    setDraft(String(clamp(value)));
  }, [value]);

  return (
    <Input
      type="number"
      min={0}
      max={100}
      step={1}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onValueChange(clamp(Number(draft)))}
      placeholder="0–100"
      data-testid="confidence-score-form-input"
    />
  );
};

export const SelectConfidenceScore = Object.assign(SelectConfidenceScoreRoot, {
  FormItem: SelectConfidenceScoreFormItem,
  Bar: ConfidenceScoreBar,
});
