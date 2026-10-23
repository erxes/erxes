import { useMemo } from 'react';
import { StaticSideMenuTab } from '../components/RelationWidgetSideTabs';
import { getRelationWidgetLabel, resolveAccess } from '../utils';
import {
  useRelationWidget,
  WidgetAccessProp,
} from '../widget-provider/context/widgetContext';
import { IRecordSidePanelTab } from './RecordSidePanel';

// A relation widget as a tab, with the plugin it comes from ('core' for
// core modules) so a host can group them.
export type IRelationWidgetTab = IRecordSidePanelTab & { pluginName: string };

/**
 * Every enabled plugin's relation widget for a record, as side panel tabs.
 * Each widget lists the records of the host's customer and company (the
 * host itself when it is one), read by its plugin from the records' own
 * `customerId` / `companyId`.
 */
export const useRelationWidgetTabs = ({
  contentType,
  contentId,
  customerId,
  companyId,
  access = 'write',
  hiddenPlugins,
  hiddenModules,
  skip = false,
}: {
  // No relation tabs (and no lookups), e.g. for records whose links are
  // their customers and companies, shown in their detail.
  skip?: boolean;
  contentType: string;
  contentId: string;
  customerId?: string;
  companyId?: string;
  access?: WidgetAccessProp;
  hiddenPlugins?: string[];
  hiddenModules?: string[];
}): IRelationWidgetTab[] => {
  const { RelationWidget, relationWidgetsModules } = useRelationWidget({
    contentType,
    hiddenPlugins,
    hiddenModules,
  });

  return useMemo(
    () =>
      (skip ? [] : relationWidgetsModules).map((module) => ({
        value: `${module.pluginName}.${module.name}`,
        pluginName: module.pluginName,
        label: getRelationWidgetLabel(module),
        icon: module.icon,
        content: (
          <StaticSideMenuTab value={module.name}>
            <div className="flex flex-col flex-1 min-h-0 bg-sidebar">
              <RelationWidget
                module={module.name}
                pluginName={module.pluginName}
                contentId={contentId}
                contentType={contentType}
                customerId={customerId}
                companyId={companyId}
                access={resolveAccess(access, module.name)}
              />
            </div>
          </StaticSideMenuTab>
        ),
      })),
    [
      skip,
      relationWidgetsModules,
      RelationWidget,
      contentId,
      contentType,
      customerId,
      companyId,
      access,
    ],
  );
};
