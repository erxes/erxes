import { createContext, useContext } from 'react';
import { Icon } from '@tabler/icons-react';

export interface IRelationWidgetProps {
  module: string;
  pluginName: string;
  contentId: string;
  contentType: string;
  customerId?: string;
}

export interface IRelationModules {
  name: string;
  pluginName: string;
  icon: Icon;
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

export const useRelationWidget = () => {
  return useContext(RelationWidgetContext);
};
