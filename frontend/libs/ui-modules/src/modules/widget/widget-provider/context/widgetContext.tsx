import { createContext, useContext } from 'react';
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
  access?: 'read' | 'write';
}

export interface IRelationModules {
  name: string;
  pluginName: string;
  icon: Icon;
  label?: string;
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

  const hideCore = hideCoreRelations
    ? hideCoreRelations
    : REACT_APP_HIDE_CORE_MODULES === 'true'
    ? true
    : false;

  let filteredModules = context.relationWidgetsModules || [];

  filteredModules = filteredModules.filter(
    (module) =>
      !module.contentTypes ||
      (!!contentType && module.contentTypes.includes(contentType)),
  );

  if (hiddenPlugins) {
    filteredModules = filteredModules.filter(
      (module) => !hiddenPlugins.includes(module.pluginName),
    );
  }

  if (hideCore) {
    filteredModules = filteredModules.filter(
      (module) => module.pluginName !== 'core',
    );
  }

  if (hiddenModules) {
    filteredModules = filteredModules.filter(
      (module) => !hiddenModules.includes(module.name),
    );
  }

  return {
    ...context,
    relationWidgetsModules: filteredModules,
  };
};
