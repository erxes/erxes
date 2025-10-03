import { IconDirection } from '@tabler/icons-react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import React, { createContext, useContext, useState } from 'react';
import { ActionsInline } from 'ui-modules/modules/permissions/components/ActionsInline';
import { usePermissionsActions } from 'ui-modules/modules/permissions/hooks/usePermissions';
import { IPermissionAction } from 'ui-modules/modules/permissions/types/permission';

export interface ISelectActionsContext {
  onSelect: (action: IPermissionAction) => void;
  actions?: IPermissionAction[];
  actionsNames?: string[];
  setActions?: (actions: IPermissionAction[]) => void;
  loading: boolean;
  error: string | null;
}

export const SelectActionsContext = createContext<ISelectActionsContext | null>(
  null,
);

export const useSelectActionsContext = () => {
  const context = useContext(SelectActionsContext);

  if (!context) {
    throw new Error(
      'useSelectActionsContext must be used within a SelectActionsContext',
    );
  }

  return context;
};

export const SelectActionsProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
}) => {
  const [actions, setActions] = useState<IPermissionAction[]>([]);
  const isSingleMode = mode === 'single';

  const onSelect = (action: IPermissionAction) => {
    if (!action) {
      return;
    }

    if (isSingleMode) {
      setActions([action]);
      return onValueChange?.(action.name);
    }
    const arrayValue = Array.isArray(value) ? value : [];

    const isActionsSelected = arrayValue.includes(action.name);
    const newSelectedActionNames = isActionsSelected
      ? arrayValue.filter((name) => name !== action.name)
      : [...arrayValue, action.name];

    setActions(actions.filter((a) => newSelectedActionNames.includes(a.name)));
    onValueChange?.(newSelectedActionNames);
  };

  return (
    <SelectActionsContext.Provider
      value={{
        actions,
        setActions,
        actionsNames: !value ? [] : Array.isArray(value) ? value : [value],
        onSelect,
        loading: false,
        error: null,
      }}
    >
      {children}
    </SelectActionsContext.Provider>
  );
};

const SelectActionsValue = ({ module }: { module?: string }) => {
  const { actions, actionsNames, setActions } = useSelectActionsContext();

  return (
    <ActionsInline
      actions={actions as IPermissionAction[]}
      actionsNames={actionsNames}
      updateActions={setActions}
      module={module}
    />
  );
};

export const SelectActionsContent = ({
  selectedModule,
}: {
  selectedModule?: string;
}) => {
  const { actionsNames, onSelect } = useSelectActionsContext();

  const { actions, loading, error } = usePermissionsActions();
  const actionsData =
    actions &&
    actions?.length > 0 &&
    actions.filter((a) => a.module === selectedModule);

  return (
    <Command shouldFilter={false}>
      <Command.List className="max-h-[300px] overflow-y-auto">
        <Combobox.Empty loading={loading} error={error} />
        {actionsData && actionsData?.length > 0 && (
          <>
            {actionsData.map((action) => (
              <Command.Item
                key={action.name}
                value={action.name}
                onSelect={() => onSelect(action)}
              >
                {action.name}
                <Combobox.Check checked={actionsNames?.includes(action.name)} />
              </Command.Item>
            ))}
          </>
        )}
      </Command.List>
    </Command>
  );
};

export const SelectActionsFormItem = ({
  className,
  selectedModule,
  ...props
}: Omit<React.ComponentProps<typeof SelectActionsProvider>, 'children'> & {
  className?: string;
  selectedModule?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectActionsProvider
      {...props}
      onValueChange={(value) => {
        props.mode === 'single' && setOpen(false);
        props.onValueChange?.(value);
      }}
    >
      <Popover onOpenChange={setOpen} open={open}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full', className)}>
            <SelectActionsValue />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectActionsContent selectedModule={selectedModule} />
        </Combobox.Content>
      </Popover>
    </SelectActionsProvider>
  );
};

const SelectActionsFilterBarItem = () => {
  const [module] = useQueryState<string>('module');
  const [action, setAction] = useQueryState<string>('action');
  const [open, setOpen] = useState(false);

  if (!module) return null;

  return (
    <Filter.BarItem queryKey="action">
      <Filter.BarName>
        <IconDirection />
        Action
      </Filter.BarName>
      <SelectActionsProvider
        mode="single"
        value={action as string}
        onValueChange={(value) => {
          setAction(value as string);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="action" className="rounded-l">
              <SelectActionsValue module={module} />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectActionsContent selectedModule={module} />
          </Combobox.Content>
        </Popover>
      </SelectActionsProvider>
    </Filter.BarItem>
  );
};

export const SelectActions = {
  Provider: SelectActionsProvider,
  Value: SelectActionsValue,
  Content: SelectActionsContent,
  FormItem: SelectActionsFormItem,
  BarItem: SelectActionsFilterBarItem,
};
