import { NotificationModule } from '@erxes/ui-notifications/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { HeaderItems, SidebarList } from '@erxes/ui/src/layout/styles';
import { __, router } from '@erxes/ui/src/utils';
import React from 'react';
import { Link, Location, NavigateFunction } from 'react-router-dom';

type ItemProps = {
  value?: string;
  isActive: boolean;
  icon: string;
  label: string;
  navigate: NavigateFunction;
  location: Location;
};

const SidebarItem = ({
  value,
  isActive,
  icon,
  label,
  navigate,
  location
}: ItemProps) => {
  return (
    <li onClick={() => router.setParams(navigate, location, { type: value })}>
      <Link to={''} className={isActive ? 'active' : ''}>
        <Icon icon={icon} />
        {__(label)}
        <HeaderItems $rightAligned={true}>
          {isActive && <Icon icon="angle-right" />}
        </HeaderItems>
      </Link>
    </li>
  );
};

type Props = {
  queryParams: any;
  modules: NotificationModule[];
  navigate: NavigateFunction;
  location: Location;
};

const SideBar = ({ location, navigate, queryParams, modules }: Props) => {
  return (
    <LeftSidebar hasBorder>
      <SidebarList>
        <SidebarItem
          location={location}
          navigate={navigate}
          value={undefined}
          isActive={!queryParams?.type}
          label="General"
          icon="bell"
        />
        {modules.map(module => (
          <SidebarItem
            location={location}
            navigate={navigate}
            value={module.name}
            isActive={queryParams?.type === module.name}
            label={module.description}
            icon={module.icon}
          />
        ))}
      </SidebarList>
    </LeftSidebar>
  );
};

export default SideBar;
