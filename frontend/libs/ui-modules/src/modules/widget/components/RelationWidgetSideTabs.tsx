import { Icon } from '@tabler/icons-react';
import { FocusSheet, SideMenuContext } from 'erxes-ui';
import { useMemo } from 'react';
import {
  useRelationWidget,
  WidgetAccessProp,
} from '../widget-provider/context/widgetContext';
import { getRelationWidgetLabel, resolveAccess } from '../utils';
import { useRelatedContacts } from '../hooks/useRelatedContacts';

export interface IRelationWidgetExtraTab {
  value: string;
  label: string;
  icon: Icon;
  content: React.ReactNode;
}

const noop = () => undefined;

// Widgets written for a SideMenu read their tab from this context; inside a
// FocusSheet each one is always its own active tab.
export const StaticSideMenuTab = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => {
  const context = useMemo(
    () => ({ activeTab: value, setActiveTab: noop }),
    [value],
  );

  return (
    <SideMenuContext.Provider value={context}>
      {children}
    </SideMenuContext.Provider>
  );
};

export const RelationWidgetSideTabs = ({
  contentId,
  contentType,
  access = 'write',
  hookOptions,
  customerId,
  companyId,
  extraTabs = [],
}: {
  contentId: string;
  contentType: string;
  access?: WidgetAccessProp;
  hookOptions?: {
    hiddenPlugins?: string[];
    hiddenModules?: string[];
    hideCoreRelations?: boolean;
  };
  customerId?: string;
  companyId?: string;
  // Host-owned tabs shown after the relation widgets, e.g. properties.
  extraTabs?: IRelationWidgetExtraTab[];
}) => {
  const { RelationWidget, relationWidgetsModules } = useRelationWidget({
    ...hookOptions,
    contentType,
  });
  const { customerIds, companyIds } = useRelatedContacts({
    contentType,
    contentId,
    customerId,
    companyId,
  });

  return (
    <FocusSheet.SideTabs>
      {relationWidgetsModules.map((module) => (
        <FocusSheet.SideContent key={module.name} value={module.name}>
          <StaticSideMenuTab value={module.name}>
            <RelationWidget
              module={module.name}
              pluginName={module.pluginName}
              contentId={contentId}
              contentType={contentType}
              customerId={customerId}
              companyId={companyId}
              customerIds={customerIds}
              companyIds={companyIds}
              access={resolveAccess(access, module.name)}
            />
          </StaticSideMenuTab>
        </FocusSheet.SideContent>
      ))}
      {extraTabs.map((tab) => (
        <FocusSheet.SideContent key={tab.value} value={tab.value}>
          {tab.content}
        </FocusSheet.SideContent>
      ))}
      <FocusSheet.SideTabsList>
        {relationWidgetsModules.map((module) => (
          <FocusSheet.SideTabsTrigger
            key={module.name}
            value={module.name}
            Icon={module.icon}
            label={getRelationWidgetLabel(module)}
          />
        ))}
        {extraTabs.map((tab) => (
          <FocusSheet.SideTabsTrigger
            key={tab.value}
            value={tab.value}
            Icon={tab.icon}
            label={tab.label}
          />
        ))}
      </FocusSheet.SideTabsList>
    </FocusSheet.SideTabs>
  );
};
