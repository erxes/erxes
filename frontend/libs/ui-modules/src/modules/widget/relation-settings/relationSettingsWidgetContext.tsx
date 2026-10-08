import { Icon } from '@tabler/icons-react';
import { createContext, useContext } from 'react';
import { TAutomationReturnLink } from '../../automations/utils/automationSeedLink';

// A purchase source's own trigger, offered at a few scopes ("this POS",
// "every POS"); the widget never learns what the source is.
export interface IRelationSettingsTriggerScope {
  key: string;
  label: string;
  triggerConfig: Record<string, unknown>;
}

export interface IRelationSettingsWidgetContext {
  triggerType?: string;
  scopes?: IRelationSettingsTriggerScope[];
  // How the source's trigger names its buyer, e.g. `{{ trigger.customerId }}`.
  buyerAttribution?: string;
  label?: string;
  returnTo?: TAutomationReturnLink;
}

export interface IRelationSettingsWidgetProps {
  module: string;
  pluginName: string;
  contentType: string;
  contentId: string;
  context: IRelationSettingsWidgetContext;
}

export interface IRelationSettingsModule {
  name: string;
  pluginName: string;
  icon?: Icon;
  label?: string;
}

type TRelationSettingsWidgetContextValue = {
  RelationSettingsWidget: (
    props: IRelationSettingsWidgetProps,
  ) => JSX.Element | null;
  relationSettingsWidgetsModules: IRelationSettingsModule[];
};

const RelationSettingsWidgetContext =
  createContext<TRelationSettingsWidgetContextValue>({
    RelationSettingsWidget: () => null,
    relationSettingsWidgetsModules: [],
  });

export const RelationSettingsWidgetProvider = ({
  children,
  ...value
}: TRelationSettingsWidgetContextValue & { children: React.ReactNode }) => (
  <RelationSettingsWidgetContext.Provider value={value}>
    {children}
  </RelationSettingsWidgetContext.Provider>
);

export const useRelationSettingsWidget = () =>
  useContext(RelationSettingsWidgetContext);
