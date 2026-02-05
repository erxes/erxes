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
import { IconBuildingStore } from '@tabler/icons-react';

interface ISubBranchDistrict {
  subBranchCode: string;
  subBranchName: string;
}

interface SelectSubBranchDistrictContextType {
  value: string;
  onValueChange: (subBranchDistrict: string) => void;
  subBranchDistricts?: ISubBranchDistrict[];
  branchCode?: string;
}

const SelectSubBranchDistrictContext =
  createContext<SelectSubBranchDistrictContextType | null>(null);

const useSelectSubBranchDistrictContext = () => {
  const context = useContext(SelectSubBranchDistrictContext);
  if (!context) {
    throw new Error(
      'useSelectSubBranchDistrictContext must be used within SelectSubBranchDistrictProvider',
    );
  }
  return context;
};

export const SelectSubBranchDistrictProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
  branchCode,
}: {
  value: string | string[];
  onValueChange: (subBranchDistrict: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  branchCode?: string;
}) => {
  const subBranchDistricts = useMemo(() => {
    const selectedBranch = DISTRICTS.find(
      (district) => district.branchCode === branchCode,
    );
    return selectedBranch?.subBranches || [];
  }, [branchCode]);

  const handleValueChange = useCallback(
    (subBranchDistrict: string) => {
      if (!subBranchDistrict) return;
      onValueChange?.(subBranchDistrict);
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
      subBranchDistricts,
      branchCode,
    }),
    [value, handleValueChange, subBranchDistricts, mode, branchCode],
  );

  return (
    <SelectSubBranchDistrictContext.Provider value={contextValue}>
      {children}
    </SelectSubBranchDistrictContext.Provider>
  );
};

const SelectSubBranchDistrictValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, subBranchDistricts } = useSelectSubBranchDistrictContext();
  const selectedSubBranchDistrict = subBranchDistricts?.find(
    (district) => district.subBranchCode === value,
  );

  if (!selectedSubBranchDistrict) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select sub branch district'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedSubBranchDistrict.subBranchName}
      </p>
    </div>
  );
};

const SelectSubBranchDistrictCommandItem = ({
  subBranchDistrict,
}: {
  subBranchDistrict: ISubBranchDistrict;
}) => {
  const { onValueChange, value } = useSelectSubBranchDistrictContext();
  const { subBranchCode, subBranchName } = subBranchDistrict || {};

  return (
    <Command.Item
      value={subBranchCode}
      onSelect={() => {
        onValueChange(subBranchCode);
      }}
    >
      <span className="font-medium">{subBranchName}</span>
      <Combobox.Check checked={value === subBranchCode} />
    </Command.Item>
  );
};

const SelectSubBranchDistrictContent = () => {
  const { subBranchDistricts } = useSelectSubBranchDistrictContext();

  return (
    <Command>
      <Command.Input placeholder="Search sub branch district" />
      <Command.Empty>
        <span className="text-muted-foreground">
          No sub branch districts found
        </span>
      </Command.Empty>
      <Command.List>
        {subBranchDistricts?.map((subBranchDistrict) => (
          <SelectSubBranchDistrictCommandItem
            key={subBranchDistrict.subBranchCode}
            subBranchDistrict={subBranchDistrict}
          />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectSubBranchDistrictFilterItem = () => {
  return (
    <Filter.Item value="subBranchDistrict">
      <IconBuildingStore />
      Sub Branch District
    </Filter.Item>
  );
};

export const SelectSubBranchDistrictFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  branchCode,
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  branchCode?: string;
}) => {
  const [subBranchDistrict, setSubBranchDistrict] = useQueryState<
    string[] | string
  >(queryKey || 'subBranchDistrict');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'subBranchDistrict'}>
      <SelectSubBranchDistrictProvider
        mode={mode}
        value={subBranchDistrict || (mode === 'single' ? '' : [])}
        branchCode={branchCode}
        onValueChange={(value) => {
          setSubBranchDistrict(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectSubBranchDistrictContent />
      </SelectSubBranchDistrictProvider>
    </Filter.View>
  );
};

export const SelectSubBranchDistrictFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
  branchCode,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  branchCode?: string;
}) => {
  const [subBranchDistrict, setSubBranchDistrict] = useQueryState<
    string[] | string
  >('subBranchDistrict');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'subBranchDistrict'}>
      <Filter.BarName>
        <IconBuildingStore />
        Sub Branch District
      </Filter.BarName>
      <SelectSubBranchDistrictProvider
        mode={mode}
        value={subBranchDistrict || (mode === 'single' ? '' : [])}
        branchCode={branchCode}
        onValueChange={(value) => {
          if (value.length > 0) {
            setSubBranchDistrict(value as string[] | string);
          } else {
            setSubBranchDistrict(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'subBranchDistrict'}>
              <SelectSubBranchDistrictValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectSubBranchDistrictContent />
          </Combobox.Content>
        </Popover>
      </SelectSubBranchDistrictProvider>
    </Filter.BarItem>
  );
};

export const SelectSubBranchDistrictFormItem = ({
  onValueChange,
  className,
  placeholder,
  branchCode,
  ...props
}: Omit<
  React.ComponentProps<typeof SelectSubBranchDistrictProvider>,
  'children'
> & {
  className?: string;
  placeholder?: string;
  branchCode?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectSubBranchDistrictProvider
      branchCode={branchCode}
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectSubBranchDistrictValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectSubBranchDistrictContent />
        </Combobox.Content>
      </Popover>
    </SelectSubBranchDistrictProvider>
  );
};

SelectSubBranchDistrictFormItem.displayName = 'SelectSubBranchDistrictFormItem';

const SelectSubBranchDistrictRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
  branchCode,
}: {
  value: string;
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  branchCode?: string;
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
    <SelectSubBranchDistrictProvider
      value={value}
      branchCode={branchCode}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectSubBranchDistrictValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectSubBranchDistrictContent />
        </SelectContent>
      </PopoverScoped>
    </SelectSubBranchDistrictProvider>
  );
};

export const SelectSubBranchDistrict = Object.assign(
  SelectSubBranchDistrictRoot,
  {
    Provider: SelectSubBranchDistrictProvider,
    Value: SelectSubBranchDistrictValue,
    Content: SelectSubBranchDistrictContent,
    FilterItem: SelectSubBranchDistrictFilterItem,
    FilterView: SelectSubBranchDistrictFilterView,
    FilterBar: SelectSubBranchDistrictFilterBar,
    FormItem: SelectSubBranchDistrictFormItem,
  },
);
