import { IconCheck, IconProgress } from "@tabler/icons-react";
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from "erxes-ui";
import { useState } from "react";
import { LeadStageBadge } from "./LeadStageBadge";
import { useLeadStages } from "./useLeads";
import { useLeadsT, useStageName } from "./i18n";

/** The stage list: picking one sets `?stage=`. */
const StageOptions = ({
  value,
  onSelect,
}: {
  value: string | null;
  onSelect: (id: string) => void;
}) => {
  const { stages } = useLeadStages();
  const t = useLeadsT();
  const stageName = useStageName();

  return (
    <Command>
      <Command.Input placeholder={t("stage")} variant="secondary" />
      <Command.List className="p-1">
        {stages.map((stage) => (
          <Command.Item
            key={stage.id}
            value={stageName(stage.name)}
            onSelect={() => onSelect(stage.id)}
          >
            <LeadStageBadge stage={stage} className="flex-1" />
            {stage.id === value && (
              <IconCheck className="size-4 text-primary" />
            )}
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
    {useLeadsT()("stage")}
  </Filter.Item>
);

/** The stage list inside the filter popover. */
const LeadStageFilterView = () => {
  const [stage, setStage] = useQueryState<string>("stage");
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
  const [stage, setStage] = useQueryState<string>("stage");
  const { byId } = useLeadStages();
  const t = useLeadsT();
  const [open, setOpen] = useState(false);

  if (!stage) return null;

  return (
    <Filter.BarItem queryKey="stage">
      <Filter.BarName>
        <IconProgress />
        {t("stage")}
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

export const LeadStageFilter = {
  Item: LeadStageFilterItem,
  View: LeadStageFilterView,
  Bar: LeadStageFilterBar,
};
