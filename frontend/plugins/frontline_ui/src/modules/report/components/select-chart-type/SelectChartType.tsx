import {
  Combobox,
  Command,
  IconComponent,
  Popover,
  PopoverScoped,
} from 'erxes-ui';
import { createContext, useContext, useState } from 'react';
import { ResponsesChartType, ResponsesChartTypeOption } from '../../types';
import { RESPONSES_CHART_TYPE_OPTIONS } from '../../constants/modules';

interface ChartSelectContextType {
  value: ResponsesChartType;
  onValueChange: (value: ResponsesChartType) => void;
  hideCircularCharts?: boolean;
}

const ChartSelectContext = createContext<ChartSelectContextType | null>(null);

const useChartSelectContext = () => {
  const context = useContext(ChartSelectContext);
  if (!context) {
    throw new Error(
      'useChartSelectContext must be used within ChartSelectProvider',
    );
  }
  return context;
};

export const SelectChartProvider = ({
  children,
  value,
  onValueChange,
  setOpen,
  hideCircularCharts = false,
}: {
  children: React.ReactNode;
  value: ResponsesChartType;
  onValueChange: (value: ResponsesChartType) => void;
  setOpen: (open: boolean) => void;
  hideCircularCharts?: boolean;
}) => {
  const handleValueChange = (value: ResponsesChartType) => {
    onValueChange(value);
    setOpen(false);
  };
  return (
    <ChartSelectContext.Provider
      value={{ value, onValueChange: handleValueChange, hideCircularCharts }}
    >
      {children}
    </ChartSelectContext.Provider>
  );
};

export const SelectChartValue = ({ placeholder }: { placeholder: string }) => {
  const { value } = useChartSelectContext();
  if (!value) {
    return <span className="text-accent-foreground/80">{placeholder}</span>;
  }
  const selectedChart = RESPONSES_CHART_TYPE_OPTIONS.find(
    (option) => option.value === value,
  );
  const Icon = selectedChart?.IconComponent || IconComponent;

  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4" />
    </div>
  );
};

export const SelectChartCommandItem = ({
  option,
}: {
  option: ResponsesChartTypeOption;
}) => {
  const { onValueChange, value } = useChartSelectContext();
  const Icon = option.IconComponent;
  return (
    <Command.Item
      value={option.value}
      onSelect={() => {
        onValueChange(option.value);
      }}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4" />
        <span className="text-sm">{option.label}</span>
      </div>
      <Combobox.Check checked={value === option.value} />
    </Command.Item>
  );
};

export const SelectChartContent = () => {
  const { hideCircularCharts } = useChartSelectContext();

  const filteredOptions = hideCircularCharts
    ? RESPONSES_CHART_TYPE_OPTIONS.filter(
        (option) =>
          option.value !== ResponsesChartType.Pie &&
          option.value !== ResponsesChartType.Donut &&
          option.value !== ResponsesChartType.Radar &&
          option.value !== ResponsesChartType.Table,
      )
    : RESPONSES_CHART_TYPE_OPTIONS;

  return (
    <Command>
      <Command.List>
        {filteredOptions.map((option) => (
          <SelectChartCommandItem key={option.value} option={option} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectChartRoot = ({
  value,
  onValueChange,
  hideCircularCharts = false,
}: {
  value: ResponsesChartType;
  onValueChange: (value: ResponsesChartType) => void;
  hideCircularCharts?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectChartProvider
      value={value}
      onValueChange={onValueChange}
      setOpen={setOpen}
      hideCircularCharts={hideCircularCharts}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Popover.Trigger className="bg-background rounded px-2 shadow-xs hover:bg-accent cursor-pointer transition-all duration-200 hover:text-primary/80 ease-in-out">
          <SelectChartValue placeholder="Select chart" />
        </Popover.Trigger>
        <Combobox.Content sideOffset={8} onClick={(e) => e.stopPropagation()}>
          <SelectChartContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectChartProvider>
  );
};

export const SelectChartType = Object.assign(SelectChartRoot, {
  Value: SelectChartValue,
  CommandItem: SelectChartCommandItem,
  Content: SelectChartContent,
});
