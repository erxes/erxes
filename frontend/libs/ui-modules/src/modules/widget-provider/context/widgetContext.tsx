import { createContext, useContext } from 'react';

export type RelationWidgetProps = {
  module: string;
  pluginName: string;
  contentId: string;
  contentType: string;
};

export const RelationWidgetContext = createContext<{
  RelationWidget: (props: RelationWidgetProps) => JSX.Element | null;
  relationWidgetsModules: { name: string; pluginName: string }[];
}>(
  {} as {
    RelationWidget: (props: any) => JSX.Element | null;
    relationWidgetsModules: { name: string; pluginName: string }[];
  },
);

export const RelationWidgetProvider = ({
  children,
  RelationWidget,
  relationWidgetsModules,
}: {
  children: React.ReactNode;
  RelationWidget: (props: RelationWidgetProps) => JSX.Element | null;
  relationWidgetsModules: { name: string; pluginName: string }[];
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
