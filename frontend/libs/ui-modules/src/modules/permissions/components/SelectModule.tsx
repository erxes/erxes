import { IconBlocks } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Popover,
  TextOverflowTooltip,
  Form,
  cn,
  useQueryState,
  Filter,
  useFilterContext,
  useFilterQueryState,
} from 'erxes-ui';
import React, { createContext, useContext, useState } from 'react';
import { usePermissionsModules } from 'ui-modules/modules/permissions/hooks/usePermissions';
import { IPermissionModule } from 'ui-modules/modules/permissions/types/permission';

export interface ISelectModulesContext {
  onSelect: (module: IPermissionModule) => void;
  selectedModule?: IPermissionModule;
  setSelectedModule?: (module: IPermissionModule) => void;
  selectedModuleName?: string;
  setSelectedModuleName?: (name: string) => void;
}

export const SelectModulesContext = createContext<ISelectModulesContext | null>(
  null,
);

export const useSelectModulesContext = () => {
  const context = useContext(SelectModulesContext);

  if (!context) {
    throw new Error(
      'useSelectModulesContext must be used within a <SelectModulesProvider>',
    );
  }

  return context || ({} as ISelectModulesContext);
};

export const SelectModulesProvider = ({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [selectedModule, setSelectedModule] = useState<IPermissionModule>();
  const [selectedModuleName, setSelectedModuleName] = useState<string>('');

  const onSelect = (module: IPermissionModule) => {
    if (!module) {
      return;
    }
    setSelectedModule(module);
    setSelectedModuleName(module.name);
    onValueChange?.(module.name);
  };

  return (
    <SelectModulesContext.Provider
      value={{
        selectedModule,
        setSelectedModule,
        selectedModuleName: !value ? '' : value,
        onSelect,
      }}
    >
      {children}
    </SelectModulesContext.Provider>
  );
};

const SelectModuleValue = () => {
  const { selectedModuleName } = useSelectModulesContext();
  return (
    <Combobox.Value placeholder="Select Module" value={selectedModuleName} />
  );
};

const SelectModuleCommand = () => {
  const { onSelect, selectedModuleName } = useSelectModulesContext();
  const { modules, loading, error } = usePermissionsModules();

  return (
    <Command shouldFilter={false}>
      <Command.List className="max-h-[300px] overflow-y-auto">
        <Combobox.Empty loading={loading} error={error} />
        {modules &&
          modules.map((module) => (
            <Command.Item
              key={module.name}
              value={module.name}
              onSelect={() => onSelect(module)}
            >
              <TextOverflowTooltip
                value={module.name}
                className="flex-auto w-auto font-medium"
              />
              <Combobox.Check checked={selectedModuleName === module.name} />
            </Command.Item>
          ))}
      </Command.List>
    </Command>
  );
};

export const SelectModuleFormItem = ({
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectModulesProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectModulesProvider
      {...props}
      onValueChange={(value) => {
        setOpen(false);
        props.onValueChange?.(value);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full', className)}>
            <SelectModuleValue />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectModuleCommand />
        </Combobox.Content>
      </Popover>
    </SelectModulesProvider>
  );
};

const SelectModuleFilterItem = () => {
  return (
    <Filter.Item value="module">
      <IconBlocks />
      Module
    </Filter.Item>
  );
};

const SelectModuleFilterView = () => {
  const [module, setModule] = useQueryState<string>('module');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="module">
      <SelectModulesProvider
        value={module || ''}
        onValueChange={(value) => {
          setModule(value as string);
          resetFilterState();
        }}
      >
        <SelectModuleCommand />
      </SelectModulesProvider>
    </Filter.View>
  );
};

const SelectModuleFilterBarItem = () => {
  const [module, setModule] = useQueryState<string>('module');
  const { resetFilterState } = useFilterContext();
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="module">
      <Filter.BarName>
        <IconBlocks />
        Module
      </Filter.BarName>
      <SelectModulesProvider
        value={module as string}
        onValueChange={(value) => {
          setModule(value as string);
          resetFilterState();
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="module" className="rounded-l">
              <SelectModuleValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectModuleCommand />
          </Combobox.Content>
        </Popover>
      </SelectModulesProvider>
    </Filter.BarItem>
  );
};

export const SelectModule = {
  Provider: SelectModulesProvider,
  Value: SelectModuleValue,
  Command: SelectModuleCommand,
  FormItem: SelectModuleFormItem,
  FilterItem: SelectModuleFilterItem,
  FilterView: SelectModuleFilterView,
  BarItem: SelectModuleFilterBarItem,
};
