import {
  Combobox,
  Filter,
  Input,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useEffect, useState } from 'react';

import { IconTrendingUp } from '@tabler/icons-react';

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const ConfidenceFilterEditor = ({
  value,
  onCommit,
}: {
  value: number | null;
  onCommit: (next: number | null) => void;
}) => {
  const [draft, setDraft] = useState<string>(
    value === null || value === undefined ? '' : String(value),
  );

  useEffect(() => {
    setDraft(value === null || value === undefined ? '' : String(value));
  }, [value]);

  const commit = () => {
    if (draft === '') {
      onCommit(null);
      return;
    }
    const next = clamp(Number(draft));
    onCommit(next);
  };

  return (
    <div className="p-2 flex flex-col gap-2 w-48">
      <Input
        type="number"
        min={0}
        max={100}
        step={1}
        value={draft}
        placeholder="Minimum confidence"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        autoFocus
        data-testid="confidence-score-filter-input"
      />
    </div>
  );
};

export const SelectConfidenceScoreFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconTrendingUp />
      {label}
    </Filter.Item>
  );
};

const SelectConfidenceScoreFilterView = () => {
  const [min, setMin] = useQueryState<number | null>('confidenceScoreMin');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="confidenceScoreMin">
      <ConfidenceFilterEditor
        value={min}
        onCommit={(next) => {
          setMin(next);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

const SelectConfidenceScoreFilterBar = () => {
  const [min, setMin] = useQueryState<number | null>('confidenceScoreMin');
  const [open, setOpen] = useState(false);

  if (min === null || min === undefined) return null;

  return (
    <Filter.BarItem queryKey="confidenceScoreMin">
      <Filter.BarName>
        <IconTrendingUp />
        By Confidence
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="confidenceScoreMin">
            <IconTrendingUp />≥ {clamp(min)}%
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <ConfidenceFilterEditor
            value={min}
            onCommit={(next) => {
              setMin(next);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const SelectConfidenceScore = Object.assign(ConfidenceFilterEditor, {
  FilterBar: SelectConfidenceScoreFilterBar,
  FilterView: SelectConfidenceScoreFilterView,
  FilterItem: SelectConfidenceScoreFilterItem,
});
