import {
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
} from '@/operation/components/SelectOperation';
import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';
import { ITeam } from '@/team/types';
import {
  Badge,
  Combobox,
  Command,
  Filter,
  IconComponent,
  PopoverScoped,
  TextOverflowTooltip,
  useFilterContext,
  useFilterQueryState,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';

interface SelectTeamContextType {
  value: string | string[];
  onValueChange: (value: string) => void;
  mode: 'single' | 'multiple';
  loading: boolean;
  teams?: ITeam[];
}

const SelectTeamContext = React.createContext<SelectTeamContextType | null>(
  null,
);

const useSelectTeamContext = () => {
  const context = React.useContext(SelectTeamContext);
  if (!context) {
    throw new Error(
      'useSelectTeamContext must be used within SelectTeamProvider',
    );
  }
  return context;
};

const SelectTeamProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
  setOpen,
}: {
  children: React.ReactNode;
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  mode?: 'single' | 'multiple';
  setOpen?: (open: boolean) => void;
}) => {
  const { teams, loading } = useGetCurrentUsersTeams();

  const handleValueChange = (teamId: string) => {
    if (!teamId) return;
    if (mode === 'single') {
      onValueChange(teamId);
      setOpen?.(false);
      return;
    }

    const arrayValue = Array.isArray(value) ? value : ([] as string[]);
    const isTeamSelected = arrayValue.includes(teamId);

    const newSelectedTeamIds = isTeamSelected
      ? arrayValue.filter((id) => id !== teamId)
      : [...arrayValue, teamId];

    onValueChange(newSelectedTeamIds);
  };

  return (
    <SelectTeamContext.Provider
      value={{ value, onValueChange: handleValueChange, mode, loading, teams }}
    >
      {children}
    </SelectTeamContext.Provider>
  );
};

const SelectTeamValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, teams } = useSelectTeamContext();

  if (!teams || teams.length === 0 || !value || !value.length) {
    return (
      <span className="text-muted-foreground">
        {placeholder || 'Select teams...'}
      </span>
    );
  }

  const selectedTeams = teams?.filter((team) => value.includes(team._id)) || [];

  if (selectedTeams.length > 1) {
    return (
      <div className="flex gap-2 items-center">
        {selectedTeams.map((team) => (
          <Badge key={team._id} variant="secondary">
            <IconComponent name={team.icon} className="size-4 flex-shrink-0" />
            <TextOverflowTooltip value={team.name} className="max-w-32" />
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <IconComponent
        name={selectedTeams[0]?.icon}
        className="size-4 flex-shrink-0"
      />
      <TextOverflowTooltip
        value={selectedTeams[0]?.name}
        className="max-w-32"
      />
    </div>
  );
};

const SelectTeamCommandItem = ({ team }: { team: ITeam }) => {
  const { onValueChange, value } = useSelectTeamContext();

  return (
    <Command.Item
      value={team._id}
      onSelect={() => {
        onValueChange(team._id);
      }}
    >
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <IconComponent name={team.icon} className="size-4" />
        <TextOverflowTooltip value={team.name} />
      </div>
      <Combobox.Check checked={value.includes(team._id)} />
    </Command.Item>
  );
};

const SelectTeamContent = () => {
  const { loading, teams } = useSelectTeamContext();
  return (
    <Command>
      <Command.Input placeholder="Search teams..." />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {teams?.map((team) => (
          <SelectTeamCommandItem key={team._id} team={team} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectTeamRoot = ({
  variant = 'detail',
  scope,
  value,
  onValueChange,
  mode = 'single',
}: {
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  mode: 'single' | 'multiple';
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectTeamProvider
      value={value}
      onValueChange={onValueChange}
      mode={mode}
      setOpen={setOpen}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant={variant}>
          <SelectTeamValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <SelectTeamContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectTeamProvider>
  );
};

const SelectTeamFilterBar = ({ scope }: { scope?: string }) => {
  const [team, setTeam] = useQueryState<string>('team');
  const [open, setOpen] = useState(false);

  return (
    <SelectTeamProvider
      value={team || ''}
      onValueChange={(value) => setTeam(value as string)}
      setOpen={setOpen}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant="filter">
          <SelectTeamValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant="filter">
          <SelectTeamContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectTeamProvider>
  );
};

const SelectTeamFilterView = () => {
  const [team, setTeam] = useFilterQueryState<string>('team');
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="team">
      <SelectTeamProvider
        value={team || ''}
        onValueChange={(value) => {
          setTeam(value as string);
          resetFilterState();
        }}
      >
        <SelectTeamContent />
      </SelectTeamProvider>
    </Filter.View>
  );
};

const SelectTeamFormItem = ({
  value,
  onValueChange,
  mode = 'multiple',
}: {
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectTeamProvider
      value={value}
      onValueChange={onValueChange}
      mode={mode}
      setOpen={setOpen}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant="form">
          <SelectTeamValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant="form">
          <SelectTeamContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectTeamProvider>
  );
};

export const SelectTeam = Object.assign(SelectTeamRoot, {
  FilterBar: SelectTeamFilterBar,
  FilterView: SelectTeamFilterView,
  FormItem: SelectTeamFormItem,
});
