import { createContext, useContext, useMemo } from 'react';
import { Icon } from '@tabler/icons-react';
import { REACT_APP_HIDE_CORE_MODULES } from 'erxes-ui';

export type WidgetAccessMap = Record<string, 'read' | 'write'>;

export type WidgetAccessProp = 'read' | 'write' | WidgetAccessMap;

export interface IRelationWidgetProps {
  module: string;
  pluginName: string;
  contentId: string;
  contentType: string;
  customerId?: string;
  companyId?: string;
  // Every contact the host record is linked to, resolved by the host. Contacts
  // are the hub between plugins: a widget shows its own records linked to
  // these alongside the ones linked to the host itself.
  customerIds?: string[];
  companyIds?: string[];
  access?: 'read' | 'write';
}

export interface IRelationModules {
  name: string;
  pluginName: string;
  icon: Icon;
  label?: string;
  // Host record types this widget shows on; every host when omitted.
  contentTypes?: string[];
}

export const RelationWidgetContext = createContext<{
  RelationWidget: (props: IRelationWidgetProps) => JSX.Element | null;
  relationWidgetsModules: IRelationModules[];
}>(
  {} as {
    RelationWidget: (props: IRelationWidgetProps) => JSX.Element | null;
    relationWidgetsModules: IRelationModules[];
  },
);

export const RelationWidgetProvider = ({
  children,
  RelationWidget,
  relationWidgetsModules,
}: {
  children: React.ReactNode;
  RelationWidget: (props: IRelationWidgetProps) => JSX.Element | null;
  relationWidgetsModules: IRelationModules[];
}) => {
  return (
    <RelationWidgetContext.Provider
      value={{ RelationWidget, relationWidgetsModules }}
    >
      {children}
    </RelationWidgetContext.Provider>
  );
};

export const useRelationWidget = (options?: {
  hiddenPlugins?: string[];
  hiddenModules?: string[];
  hideCoreRelations?: boolean;
  contentType?: string;
}) => {
  const context = useContext(RelationWidgetContext);

  const { hiddenPlugins, hiddenModules, hideCoreRelations, contentType } =
    options || {};

  const hideCore =
    !!hideCoreRelations || REACT_APP_HIDE_CORE_MODULES === 'true';

  // Arrays from callers are usually inline literals; key on their contents.
  const hiddenPluginsKey = (hiddenPlugins || []).join(',');
  const hiddenModulesKey = (hiddenModules || []).join(',');

  const relationWidgetsModules = useMemo(() => {
    const hiddenPluginNames = hiddenPluginsKey.split(',');
    const hiddenModuleNames = hiddenModulesKey.split(',');

    return (context.relationWidgetsModules || []).filter(
      (module) =>
        (!module.contentTypes ||
          (!!contentType && module.contentTypes.includes(contentType))) &&
        !hiddenPluginNames.includes(module.pluginName) &&
        !(hideCore && module.pluginName === 'core') &&
        !hiddenModuleNames.includes(module.name),
    );
  }, [
    context.relationWidgetsModules,
    contentType,
    hideCore,
    hiddenPluginsKey,
    hiddenModulesKey,
  ]);

  return {
    ...context,
    relationWidgetsModules,
  };
};
