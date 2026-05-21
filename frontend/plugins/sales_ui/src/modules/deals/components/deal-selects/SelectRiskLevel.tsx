import {
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';

import { IconAlertTriangle } from '@tabler/icons-react';
import {
  DEFAULT_RISK_LEVEL,
  RISK_LEVEL_LABELS,
  RISK_LEVEL_OPTIONS,
  TRiskLevel,
} from '@/deals/constants/riskLevel';
import {
  RiskLevelDot,
  RiskLevelTitle,
} from '@/deals/components/deal-selects/RiskLevelInline';

interface SelectRiskLevelContextType {
  value: TRiskLevel;
  onValueChange: (value: TRiskLevel) => void;
  variant?: `${SelectTriggerVariant}`;
}

const SelectRiskLevelContext =
  React.createContext<SelectRiskLevelContextType | null>(null);

const useSelectRiskLevelContext = () => {
  const context = React.useContext(SelectRiskLevelContext);
  if (!context) {
    throw new Error(
      'useSelectRiskLevelContext must be used within SelectRiskLevelProvider',
    );
  }
  return context;
};

const SelectRiskLevelProvider = ({
  children,
  value = DEFAULT_RISK_LEVEL,
  onValueChange,
  variant,
}: {
  children: React.ReactNode;
  value?: TRiskLevel;
  onValueChange: (value: TRiskLevel) => void;
  variant?: `${SelectTriggerVariant}`;
}) => (
  <SelectRiskLevelContext.Provider value={{ value, onValueChange, variant }}>
    {children}
  </SelectRiskLevelContext.Provider>
);

const SelectRiskLevelValue = () => {
  const { value } = useSelectRiskLevelContext();
  return (
    <>
      <RiskLevelDot level={value} />
      <RiskLevelTitle level={value} />
    </>
  );
};

const SelectRiskLevelCommandItem = ({ level }: { level: TRiskLevel }) => {
  const { onValueChange, value } = useSelectRiskLevelContext();
  return (
    <Command.Item
      value={RISK_LEVEL_LABELS[level]}
      onSelect={() => onValueChange(level)}
    >
      <div className="flex items-center gap-2 flex-1">
        <RiskLevelDot level={level} />
        <RiskLevelTitle level={level} />
      </div>
      <Combobox.Check checked={value === level} />
    </Command.Item>
  );
};

const SelectRiskLevelContent = () => (
  <Command>
    <Command.List>
      {RISK_LEVEL_OPTIONS.map((level) => (
        <SelectRiskLevelCommandItem key={level} level={level} />
      ))}
    </Command.List>
  </Command>
);

const SelectRiskLevelRoot = ({
  value,
  onValueChange,
  scope,
  variant,
}: {
  value?: TRiskLevel;
  onValueChange: (value: TRiskLevel) => void;
  scope?: string;
  variant: `${SelectTriggerVariant}`;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectRiskLevelProvider
      value={value}
      onValueChange={(v) => {
        setOpen(false);
        onValueChange(v);
      }}
      variant={variant}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant={variant}>
          <SelectRiskLevelValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <SelectRiskLevelContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectRiskLevelProvider>
  );
};

const isRiskLevel = (value: string): value is TRiskLevel =>
  (RISK_LEVEL_OPTIONS as readonly string[]).includes(value);

const SelectRiskLevelFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => (
  <Filter.Item value={value}>
    <IconAlertTriangle />
    {label}
  </Filter.Item>
);

const SelectRiskLevelFilterView = () => {
  const [riskLevel, setRiskLevel] = useQueryState<TRiskLevel[]>('riskLevel', {
    defaultValue: [],
  });
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="riskLevel">
      <SelectRiskLevelProvider
        value={riskLevel?.[0] ?? DEFAULT_RISK_LEVEL}
        onValueChange={(val) => {
          setRiskLevel([val]);
          resetFilterState();
        }}
      >
        <SelectRiskLevelContent />
      </SelectRiskLevelProvider>
    </Filter.View>
  );
};

const SelectRiskLevelFilterBar = () => {
  const [riskLevel, setRiskLevel] = useQueryState<TRiskLevel[]>('riskLevel', {
    defaultValue: [],
  });
  const [open, setOpen] = useState(false);

  if (!riskLevel?.[0]) return null;

  return (
    <Filter.BarItem queryKey="riskLevel">
      <Filter.BarName>
        <IconAlertTriangle />
        By Risk level
      </Filter.BarName>
      <SelectRiskLevelProvider
        value={riskLevel?.[0] ?? DEFAULT_RISK_LEVEL}
        onValueChange={(val) => {
          if (val && isRiskLevel(val)) setRiskLevel([val]);
          else setRiskLevel([]);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="riskLevel">
              <RiskLevelDot level={riskLevel?.[0] ?? DEFAULT_RISK_LEVEL} />
              <RiskLevelTitle level={riskLevel?.[0] ?? DEFAULT_RISK_LEVEL} />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectRiskLevelContent />
          </Combobox.Content>
        </Popover>
      </SelectRiskLevelProvider>
    </Filter.BarItem>
  );
};

export const SelectRiskLevel = Object.assign(SelectRiskLevelRoot, {
  FilterBar: SelectRiskLevelFilterBar,
  FilterView: SelectRiskLevelFilterView,
  FilterItem: SelectRiskLevelFilterItem,
});
