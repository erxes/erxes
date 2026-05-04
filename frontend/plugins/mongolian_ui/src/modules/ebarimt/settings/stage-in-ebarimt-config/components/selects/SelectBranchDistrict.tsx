import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  Form,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { DISTRICTS } from '../../constants/distrcitData';
import {
  SelectTriggerVariant,
  SelectTrigger,
  SelectContent,
} from './SelectShared';
import { IconBuilding } from '@tabler/icons-react';

interface IBranchDistrict {
  branchCode: string;
  branchName: string;
}

interface SelectBranchDistrictContextType {
  value: string;
  onValueChange: (branchDistrict: string) => void;
  branchDistricts?: IBranchDistrict[];
}

const SelectBranchDistrictContext =
  createContext<SelectBranchDistrictContextType | null>(null);

const useSelectBranchDistrictContext = () => {
  const context = useContext(SelectBranchDistrictContext);
  if (!context) {
    throw new Error(
      'useSelectBranchDistrictContext must be used within SelectBranchDistrictProvider',
    );
  }
  return context;
};

export const SelectBranchDistrictProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (branchDistrict: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const branchDistricts = DISTRICTS.map((district) => ({
    branchCode: district.branchCode,
    branchName: district.branchName,
  }));

  const handleValueChange = useCallback(
    (branchDistrict: string) => {
      if (!branchDistrict) return;
      onValueChange?.(branchDistrict);
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      value:
        mode === 'single'
          ? (value as string) || ''
          : (value as string[]).join(','),
      onValueChange: handleValueChange,
      branchDistricts,
    }),
    [value, handleValueChange, branchDistricts, mode],
  );

  return (
    <SelectBranchDistrictContext.Provider value={contextValue}>
      {children}
    </SelectBranchDistrictContext.Provider>
  );
};

const SelectBranchDistrictValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, branchDistricts } = useSelectBranchDistrictContext();
  const selectedBranchDistrict = branchDistricts?.find(
    (district) => district.branchCode === value,
  );

  if (!selectedBranchDistrict) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select branch district'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedBranchDistrict.branchName}
      </p>
    </div>
  );
};

const SelectBranchDistrictCommandItem = ({
  branchDistrict,
}: {
  branchDistrict: IBranchDistrict;
}) => {
  const { onValueChange, value } = useSelectBranchDistrictContext();
  const { branchCode, branchName } = branchDistrict || {};

  return (
    <Command.Item
      value={branchCode}
      onSelect={() => {
        onValueChange(branchCode);
      }}
    >
      <span className="font-medium">{branchName}</span>
      <Combobox.Check checked={value === branchCode} />
    </Command.Item>
  );
};

const SelectBranchDistrictContent = () => {
  const { branchDistricts } = useSelectBranchDistrictContext();

  return (
    <Command>
      <Command.Input placeholder="Search branch district" />
      <Command.Empty>
        <span className="text-muted-foreground">No branch districts found</span>
      </Command.Empty>
      <Command.List>
        {branchDistricts?.map((branchDistrict) => (
          <SelectBranchDistrictCommandItem
            key={branchDistrict.branchCode}
            branchDistrict={branchDistrict}
          />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectBranchDistrictFilterItem = () => {
  return (
    <Filter.Item value="branchDistrict">
      <IconBuilding />
      Branch District
    </Filter.Item>
  );
};

export const SelectBranchDistrictFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [branchDistrict, setBranchDistrict] = useQueryState<string[] | string>(
    queryKey || 'branchDistrict',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'branchDistrict'}>
      <SelectBranchDistrictProvider
        mode={mode}
        value={branchDistrict || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setBranchDistrict(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectBranchDistrictContent />
      </SelectBranchDistrictProvider>
    </Filter.View>
  );
};

export const SelectBranchDistrictFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [branchDistrict, setBranchDistrict] = useQueryState<string[] | string>(
    'branchDistrict',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'branchDistrict'}>
      <Filter.BarName>
        <IconBuilding />
        Branch District
      </Filter.BarName>
      <SelectBranchDistrictProvider
        mode={mode}
        value={branchDistrict || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setBranchDistrict(value as string[] | string);
          } else {
            setBranchDistrict(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'branchDistrict'}>
              <SelectBranchDistrictValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectBranchDistrictContent />
          </Combobox.Content>
        </Popover>
      </SelectBranchDistrictProvider>
    </Filter.BarItem>
  );
};

export const SelectBranchDistrictFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<
  React.ComponentProps<typeof SelectBranchDistrictProvider>,
  'children'
> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBranchDistrictProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs ', className)}>
            <SelectBranchDistrictValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectBranchDistrictContent />
        </Combobox.Content>
      </Popover>
    </SelectBranchDistrictProvider>
  );
};

SelectBranchDistrictFormItem.displayName = 'SelectBranchDistrictFormItem';

const SelectBranchDistrictRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (value: string) => {
      onValueChange?.(value);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectBranchDistrictProvider
      value={value}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectBranchDistrictValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectBranchDistrictContent />
        </SelectContent>
      </PopoverScoped>
    </SelectBranchDistrictProvider>
  );
};

export const SelectBranchDistrict = Object.assign(SelectBranchDistrictRoot, {
  Provider: SelectBranchDistrictProvider,
  Value: SelectBranchDistrictValue,
  Content: SelectBranchDistrictContent,
  FilterItem: SelectBranchDistrictFilterItem,
  FilterView: SelectBranchDistrictFilterView,
  FilterBar: SelectBranchDistrictFilterBar,
  FormItem: SelectBranchDistrictFormItem,
});
