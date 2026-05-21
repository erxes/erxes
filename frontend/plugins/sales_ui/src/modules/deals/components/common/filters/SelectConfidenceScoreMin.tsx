import {
  Filter,
  Input,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';

import { IconChartBar } from '@tabler/icons-react';

const clamp = (n: number) => Math.max(0, Math.min(100, Math.trunc(n)));

const ThresholdEditor = ({
  initialValue,
  onCommit,
}: {
  initialValue: number;
  onCommit: (value: number | null) => void;
}) => {
  const [draft, setDraft] = useState(String(initialValue));

  return (
    <div className="p-2 flex flex-col gap-2 w-48">
      <label className="text-xs text-muted-foreground" htmlFor="confidence-min-input">
        Minimum confidence
      </label>
      <Input
        id="confidence-min-input"
        type="number"
        min={0}
        max={100}
        value={draft}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const parsed = Number(draft);
            onCommit(Number.isFinite(parsed) ? clamp(parsed) : null);
          }
        }}
      />
      <button
        type="button"
        className="text-sm bg-primary text-primary-foreground rounded px-2 py-1"
        onClick={() => {
          const parsed = Number(draft);
          onCommit(Number.isFinite(parsed) ? clamp(parsed) : null);
        }}
      >
        Apply
      </button>
    </div>
  );
};

const SelectConfidenceScoreMinFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => (
  <Filter.Item value={value}>
    <IconChartBar />
    {label}
  </Filter.Item>
);

const SelectConfidenceScoreMinFilterView = () => {
  const [confidenceScoreMin, setConfidenceScoreMin] =
    useQueryState<number>('confidenceScoreMin');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="confidenceScoreMin">
      <ThresholdEditor
        initialValue={confidenceScoreMin ?? 0}
        onCommit={(next) => {
          setConfidenceScoreMin(next);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

const SelectConfidenceScoreMinFilterBar = () => {
  const [confidenceScoreMin, setConfidenceScoreMin] =
    useQueryState<number>('confidenceScoreMin');
  const [open, setOpen] = useState(false);

  if (confidenceScoreMin == null) return null;

  return (
    <Filter.BarItem queryKey="confidenceScoreMin">
      <Filter.BarName>
        <IconChartBar />
        Confidence ≥
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="confidenceScoreMin">
            {confidenceScoreMin}%
          </Filter.BarButton>
        </Popover.Trigger>
        <Popover.Content className="p-0">
          <ThresholdEditor
            initialValue={confidenceScoreMin}
            onCommit={(next) => {
              setConfidenceScoreMin(next);
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const SelectConfidenceScoreMin = Object.assign(
  {},
  {
    FilterBar: SelectConfidenceScoreMinFilterBar,
    FilterView: SelectConfidenceScoreMinFilterView,
    FilterItem: SelectConfidenceScoreMinFilterItem,
  },
);
