import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { SidebarList } from 'modules/layout/styles';
import React from 'react';
import { NavLink } from 'react-router-dom';
import Button from 'modules/common/components/Button';
import { TopHeader } from 'modules/common/styles/main';
import { Link } from 'react-router-dom';

function TagsSidebar() {
  const { Title } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <TopHeader>
          <Link to="/settings/">
            <Button
              btnStyle="simple"
              icon="arrow-circle-left"
              block={true}
              uppercase={false}
            >
              Back to Settings
            </Button>
          </Link>
        </TopHeader>
        <Title>{__('Tags type')}</Title>
        <SidebarList id={'TagsSidebar'}>
          <li>
            <NavLink activeClassName="active" to="/tags/engageMessage">
              {__('Campaign')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/tags/conversation">
              {__('Conversation')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/tags/customer">
              {__('Customer')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/tags/company">
              {__('Company')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/tags/integration">
              {__('Integration')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/tags/product">
              {__('Product & Service')}
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default TagsSidebar;
