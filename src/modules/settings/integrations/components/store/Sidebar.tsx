import LeftSidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import { SidebarList } from './styles';

type Props = {
  queryParams?: any;
};

class SideBar extends React.Component<Props> {
  render() {
    return (
      <LeftSidebar>
        <LeftSidebar.Section>
          <SidebarList>
            <h4>Featured</h4>
            <li>All integrations</li>
            <li>For support teams</li>
            <li>For sales teams</li>
            <li>For marketing teams</li>
          </SidebarList>
          <SidebarList>
            <h4>Plans</h4>
            <li>Free</li>
            <li>Team</li>
            <li>Organization</li>
            <li>Enterprise</li>
          </SidebarList>
          <SidebarList>
            <h4>Works with</h4>
            <li>Conversation</li>
            <li>Sales pipeline</li>
            <li>Contacts</li>
            <li>Pop ups</li>
            <li>Engage</li>
          </SidebarList>
          <SidebarList>
            <h4>Categories</h4>
            <li>Analytics</li>
            <li>Email</li>
            <li>Email marketing</li>
            <li>Messaging</li>
            <li>Tools</li>
            <li>Marketing automation</li>
            <li>Phone and video</li>
            <li>Social media</li>
            <li>Surveys and Feedback</li>
          </SidebarList>
        </LeftSidebar.Section>
      </LeftSidebar>
    );
  }
}

export default SideBar;
