import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import { teamMemberDetailActiveActionTabAtom } from '@/settings/team-member/states/teamMemberDetailStates';
import { useRelationWidgetsModules } from '@/widgets/hooks/useRelationWidgetsModules';
import { Icon, IconX } from '@tabler/icons-react';
import { Button, Resizable, SideMenu } from 'erxes-ui';
import { useAtom } from 'jotai';
import React from 'react';
import { useRelationWidget } from 'ui-modules';

export const UserDetailActions = () => {
  const { userDetail } = useUserDetail();
  const userId = userDetail?._id;
  const [activeTab, setActiveTab] = useAtom(
    teamMemberDetailActiveActionTabAtom,
  );
  const widgetsModules = useRelationWidgetsModules();
  const { RelationWidget } = useRelationWidget();

  return (
    <>
      <Resizable.Handle />
      <Resizable.Panel
        minSize={activeTab ? 30 : 0}
        maxSize={activeTab ? 60 : 0}
      >
        <SideMenu
          orientation="vertical"
          value={activeTab ?? ''}
          onValueChange={setActiveTab}
          className="h-full"
        >
          {widgetsModules.map((item) => (
            <ActionTabsContent
              key={item.name}
              value={item.name}
              icon={item.icon as any}
              title={item.name}
            >
              <RelationWidget
                module={item}
                contentId={userId || ''}
                contentType="core:user"
              />
            </ActionTabsContent>
          ))}
        </SideMenu>
      </Resizable.Panel>
      <UserDetailActionsTrigger />
    </>
  );
};

export const UserDetailActionsTrigger = () => {
  const [activeTab, setActiveTab] = useAtom(
    teamMemberDetailActiveActionTabAtom,
  );
  const widgetsModules = useRelationWidgetsModules();

  return (
    <div className="flex flex-none overflow-hidden">
      <SideMenu
        orientation="vertical"
        value={activeTab ?? ''}
        onValueChange={(value) => setActiveTab(value)}
        className="h-full"
      >
        <SideMenu.Sidebar className="border-l-0">
          {widgetsModules.map((item) => (
            <SideMenu.Trigger
              key={item.name}
              value={item.name}
              label={item.name}
              Icon={item.icon as any}
            />
          ))}
        </SideMenu.Sidebar>
      </SideMenu>
    </div>
  );
};

export const ActionTabsContent = ({
  children,
  value,
  title,
  icon,
}: {
  children: React.ReactNode;
  value: string;
  title?: string;
  icon: Icon;
}) => {
  return (
    <SideMenu.Content
      value={value}
      className="border-l-0 data-[state=active]:border-l-0 bg-background"
    >
      <ActionHeader title={title} icon={icon} />
      {children}
    </SideMenu.Content>
  );
};

export const ActionHeader = (props: { title?: string; icon: Icon }) => {
  const [activeTab, setActiveTab] = useAtom(
    teamMemberDetailActiveActionTabAtom,
  );
  return (
    <div className="flex items-center h-12 border-b px-6 text-primary gap-2 flex-none">
      <props.icon className="size-5" />
      <h4 className="font-semibold text-base">{props.title}</h4>
      <Button
        variant="secondary"
        size="icon"
        className="ml-auto"
        onClick={() => setActiveTab('')}
      >
        <IconX />
      </Button>
    </div>
  );
};
