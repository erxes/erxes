import { SideMenu, cn } from 'erxes-ui';

import { salesDetailActiveActionTabAtom } from '@/deals/states/salesDetailStates';
import { useAtom } from 'jotai';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { useRelationWidget } from 'ui-modules';

export const SalesDetailActions = () => {
  const { deal } = useDealDetail();
  const { relationWidgetsModules, RelationWidget } = useRelationWidget({
    hiddenPlugins: ['sales'],
  });

  const [activeTab, setActiveTab] = useAtom(salesDetailActiveActionTabAtom);

  return (
    <SideMenu
      orientation="vertical"
      value={activeTab ?? ''}
      onValueChange={(value) => setActiveTab(value)}
      className={cn('h-full')}
    >
      {relationWidgetsModules.map((module) => {
        return (
          <SideMenu.Content value={module.name} key={module.name}>
            <RelationWidget
              key={module.name}
              module={module.name}
              pluginName={module.pluginName}
              contentId={deal?._id || ''}
              contentType="sales:deal"
            />
          </SideMenu.Content>
        );
      })}

      <SideMenu.Sidebar>
        {relationWidgetsModules.map((module) => {
          return (
            <SideMenu.Trigger
              key={module.name}
              value={module.name}
              label={module.name}
              Icon={module.icon}
            />
          );
        })}
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
