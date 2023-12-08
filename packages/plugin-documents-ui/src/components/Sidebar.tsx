import React from 'react';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';
import { Link } from 'react-router-dom';
import { __ } from 'coreui/utils';

type Props = {
  queryParams: any;
  contentTypes: Array<{
    label: string;
    contentType: string;
    subTypes: string[];
  }>;
};

export default function Sidebar({ queryParams, contentTypes }: Props) {
  return (
    <LeftSidebar header={<SidebarHeader />} hasBorder={true}>
      <SidebarList
        noTextColor={true}
        noBackground={true}
        id={'DocumentsSidebar'}
      >
        {contentTypes.map(({ label, contentType }) => (
          <SidebarListItem
            key={contentType}
            isActive={queryParams?.contentType === contentType}
          >
            <Link to={`/settings/documents/?contentType=${contentType}`}>
              {__(label)}
            </Link>
          </SidebarListItem>
        ))}
      </SidebarList>
    </LeftSidebar>
  );
}
