import { IconCheck, IconProgress } from '@tabler/icons-react';
import { Combobox, Command, Filter, Popover, useFilterContext, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { LeadStageBadge } from './LeadStageBadge';
import { useLeadStages } from './useLeads';

/** The stage list: picking one sets `?stage=`. */
const StageOptions = ({ value, onSelect }: { value: string | null; onSelect: (id: string) => void }) => {
  const { stages } = useLeadStages();

  return (
    <Command>
      <Command.Input placeholder="Stage" variant="secondary" />
      <Command.List className="p-1">
        {stages.map((stage) => (
          <Command.Item key={stage.id} value={stage.name} onSelect={() => onSelect(stage.id)}>
            <LeadStageBadge stage={stage} className="flex-1" />
            {stage.id === value && <IconCheck className="size-4 text-primary" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

/** "Stage" in the filter menu. */
const LeadStageFilterItem = () => (
  <Filter.Item value="stage">
    <IconProgress />
    Stage
  </Filter.Item>
);

/** The stage list inside the filter popover. */
const LeadStageFilterView = () => {
  const [stage, setStage] = useQueryState<string>('stage');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="stage">
      <StageOptions
        value={stage}
        onSelect={(id) => {
          setStage(id);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

/** The chosen stage as a filter bar chip. */
const LeadStageFilterBar = () => {
  const [stage, setStage] = useQueryState<string>('stage');
  const { byId } = useLeadStages();
  const [open, setOpen] = useState(false);

  if (!stage) return null;

  return (
    <Filter.BarItem queryKey="stage">
      <Filter.BarName>
        <IconProgress />
        Stage
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="stage">
            <LeadStageBadge stage={byId.get(stage)} />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <StageOptions
            value={stage}
            onSelect={(id) => {
              setStage(id);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const LeadStageFilter = { Item: LeadStageFilterItem, View: LeadStageFilterView, Bar: LeadStageFilterBar };
