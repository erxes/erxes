import { Skeleton, TextOverflowTooltip, Tooltip, useQueryState } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { createContext, useContext } from 'react';
import { usePermissionsActions } from 'ui-modules/modules/permissions/hooks/usePermissions';
import { IPermissionAction } from 'ui-modules/modules/permissions/types/permission';

export interface IActionsInlineContext {
  actions: IPermissionAction[];
  loading: boolean;
  actionsNames?: string[];
  placeholder?: string;
  updateActions?: (actions: IPermissionAction[]) => void;
  module?: string;
}

export const ActionsInlineContext = createContext<IActionsInlineContext | null>(
  null,
);

export const useActionsInlineContext = () => {
  const context = useContext(ActionsInlineContext);
  if (!context) {
    throw new Error(
      'useActionsInlineContext must be used within a ActionsInlineProvider',
    );
  }
  return context;
};

export const ActionsInline = ({
  actions,
  actionsNames,
  placeholder,
  updateActions,
  module,
}: {
  actions: IPermissionAction[];
  actionsNames?: string[];
  placeholder?: string;
  updateActions?: (actions: IPermissionAction[]) => void;
  module?: string;
}) => {
  return (
    <ActionsInlineProvider
      actions={actions}
      actionsNames={actionsNames}
      placeholder={placeholder}
      updateActions={updateActions}
      module={module}
    >
      <ActionsInlineTitle />
    </ActionsInlineProvider>
  );
};

export const ActionsInlineProvider = ({
  children,
  actions,
  actionsNames,
  placeholder,
  updateActions,
  module,
}: {
  children?: React.ReactNode;
  actions?: IPermissionAction[];
  actionsNames?: string[];
  placeholder?: string;
  updateActions?: (actions: IPermissionAction[]) => void;
  module?: string;
}) => {
  const [_actions, _setActions] = useState<IPermissionAction[]>(actions || []);
    const [, setAction] = useQueryState<string>('action');
  useEffect(() => {
    setAction(null);
    updateActions?.([]);
  }, [module]);

  return (
    <ActionsInlineContext.Provider
      value={{
        actions: actions || _actions,
        loading: false,
        actionsNames: actionsNames || [],
        placeholder: placeholder || 'Select actions',
        updateActions: updateActions || _setActions,
        module: module || '',
      }}
    >
      {children}
      {actionsNames?.map((name) => (
        <ActionInlineEffectComponent key={name} actionName={name} />
      ))}
    </ActionsInlineContext.Provider>
  );
};

export const ActionInlineEffectComponent = ({
  actionName,
}: {
  actionName: string;
}) => {
  const { actions, actionsNames, updateActions } = useActionsInlineContext();

  const { actions: list, loading } = usePermissionsActions();
  const actionsDetail =
    list && list.find((action) => action.name === actionName);

  useEffect(() => {
    if (!actionsDetail) return;

    const newActions = [...actions].filter(
      (a) => actionsNames?.includes(a.name) && a.name !== actionsDetail.name,
    );

    const alreadyExists = actions.some((a) => a.name === actionsDetail.name);

    if (!alreadyExists) {
      updateActions?.([...newActions, actionsDetail]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsDetail]);

  return null;
};

export const ActionsInlineTitle = () => {
  const { actions, loading, placeholder } = useActionsInlineContext();

  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  if (actions.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (actions.length < 3) {
    return (
      <TextOverflowTooltip value={actions.map((a) => a.name).join(', ')} />
    );
  }

  return (
    <Tooltip>
      <Tooltip.Provider>
        <Tooltip.Trigger>{`${actions.length} actions`}</Tooltip.Trigger>
        <Tooltip.Content>
          {actions.map((action) => action.name).join(', ')}
        </Tooltip.Content>
      </Tooltip.Provider>
    </Tooltip>
  );
};
