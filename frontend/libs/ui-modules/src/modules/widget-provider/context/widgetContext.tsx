import { createContext, useContext } from 'react';
import { Icon } from '@tabler/icons-react';

export type RelationWidgetProps = {
  module: string;
  pluginName: string;
  contentId: string;
  contentType: string;
  customerId?: string;
};

export type RelationModules = {
  name: string;
  pluginName: string;
  icon: Icon;
};

export const RelationWidgetContext = createContext<{
  RelationWidget: (props: RelationWidgetProps) => JSX.Element | null;
  relationWidgetsModules: RelationModules[];
}>(
  {} as {
    RelationWidget: (props: any) => JSX.Element | null;
    relationWidgetsModules: RelationModules[];
  },
);

export const RelationWidgetProvider = ({
  children,
  RelationWidget,
  relationWidgetsModules,
}: {
  children: React.ReactNode;
  RelationWidget: (props: RelationWidgetProps) => JSX.Element | null;
  relationWidgetsModules: RelationModules[];
}) => {
  return (
    <RelationWidgetContext.Provider
      value={{ RelationWidget, relationWidgetsModules }}
    >
      {children}
    </RelationWidgetContext.Provider>
  );
};

export const useRelationWidget = () => {
  return useContext(RelationWidgetContext);
};
