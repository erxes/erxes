import { useTemplateTypes } from '@/templates/hooks/useTemplateTypes';
import { TemplateType } from '@/templates/types/Template';
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
interface SelectProjectTypesContextType {
  templateTypes?: Array<TemplateType>;
  values?: string[];
  onValueChange: (value: string[]) => void;
  variant?: `${SelectTriggerVariant}`;
}

const SelectProjectTypesContext =
  React.createContext<SelectProjectTypesContextType | null>(null);

const useSelectProjectTypesContext = () => {
  const context = React.useContext(SelectProjectTypesContext);
  if (!context) {
    throw new Error(
      'useSelectStatusContext must be used within SelectStatusProvider',
    );
  }
  return context;
};

export const SelectProjectTypesProvider = ({
  children,
  values,
  onValueChange,
  variant,
}: {
  children: React.ReactNode;
  values?: string[];
  onValueChange: (value: string[]) => void;
  variant?: `${SelectTriggerVariant}`;
}) => {
  const { templateTypes = [] } = useTemplateTypes();

  const handleValueChange = (value: string[]) => {
    if (!value) return;
    onValueChange(value);
  };

  return (
    <SelectProjectTypesContext.Provider
      value={{
        templateTypes,
        values,
        onValueChange: handleValueChange,
        variant,
      }}
    >
      {children}
    </SelectProjectTypesContext.Provider>
  );
};

const SelectProjectTypesValue = ({ placeholder }: { placeholder?: string }) => {
  const { values, templateTypes = [] } = useSelectProjectTypesContext();

  if (!values) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select status...'}
      </span>
    );
  }

  const selectedTypes = values.map(
    (value) => templateTypes.find((type) => type.type === value)?.label,
  );

  if (selectedTypes?.length > 2) {
    return (
      <>
        {selectedTypes.slice(0, 2).join(', ')},
        <span className="text-accent-foreground/80">...</span>
      </>
    );
  }

  return (
    <>
      {selectedTypes?.length ? (
        selectedTypes.join(', ')
      ) : (
        <span>Төрөл сонгоно уу</span>
      )}
    </>
  );
};

const SelectProjectTypesCommandItem = ({ type }: { type: TemplateType }) => {
  const {
    onValueChange,
    values = [],
    templateTypes = [],
  } = useSelectProjectTypesContext();

  return (
    <>
      <Command.Item
        value={type.type}
        key={type.type}
        onSelect={() => {
          const newTypes = (values || []).includes(type.type)
            ? values.filter((t) => t !== type.type)
            : [...(values || []), type.type];

          onValueChange(newTypes);
        }}
      >
        {type.label}
        <Combobox.Check checked={(values || [])?.includes(type.type)} />
      </Command.Item>
    </>
  );
};

const SelectProjectTypesContent = () => {
  const {
    onValueChange,
    values = [],
    templateTypes = [],
  } = useSelectProjectTypesContext();

  return (
    <Command id="status-command-menu">
      <Command.Input placeholder="Төрөл сонгоно уу" />
      <Command.List>
        <Command.Empty>No status found</Command.Empty>

        {templateTypes.map((type) => (
          <SelectProjectTypesCommandItem type={type} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectProjectTypesFilterView = ({ queryKey }: { queryKey?: string }) => {
  const [types, setTypes] = useQueryState<string[]>(queryKey || 'types');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'types'}>
      <SelectProjectTypesProvider
        values={types as string[]}
        onValueChange={(value) => {
          setTypes(value);
          resetFilterState();
        }}
      >
        <SelectProjectTypesContent />
      </SelectProjectTypesProvider>
    </Filter.View>
  );
};

const SelectProjectTypesFilterBar = ({ queryKey }: { queryKey?: string }) => {
  const [types, setTypes] = useQueryState<string[]>(queryKey || 'types');
  const [open, setOpen] = useState(false);

  return (
    <SelectProjectTypesProvider
      values={types as string[]}
      onValueChange={(value) => {
        setTypes(value);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={queryKey || 'types'}>
            <SelectProjectTypesValue />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <SelectProjectTypesContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectProjectTypesProvider>
  );
};

const SelectProjectTypesRoot = ({
  value,
  variant,
  scope,
  onValueChange,
}: {
  value?: string[];
  variant: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = (value: string[]) => {
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <SelectProjectTypesProvider
      values={value}
      onValueChange={handleValueChange}
      variant={variant}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant={variant}>
          <SelectProjectTypesValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <SelectProjectTypesContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectProjectTypesProvider>
  );
};

export const SelectTemplateContentTypes = Object.assign(
  SelectProjectTypesRoot,
  {
    FilterView: SelectProjectTypesFilterView,
    FilterBar: SelectProjectTypesFilterBar,
  },
);
