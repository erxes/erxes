import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';

import { SideMenu } from 'erxes-ui';
import { useRelationWidget } from 'ui-modules';

export const ConversationSideWidget = () => {
  const { customerId, _id } = useConversationContext();
  const { relationWidgetsModules, RelationWidget } = useRelationWidget();

  return (
    <SideMenu>
      {relationWidgetsModules.map((module) => {
        return (
          <SideMenu.Content value={module.name} key={module.name}>
            <RelationWidget
              key={module.name}
              module={module.name}
              pluginName={module.pluginName}
              contentId={_id}
              contentType="inbox:conversation"
              customerId={customerId}
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
