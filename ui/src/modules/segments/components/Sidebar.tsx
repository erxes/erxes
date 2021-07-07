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
        <Title>{__('Segments')}</Title>
        <SidebarList id={'SegmentSidebar'}>
          <li>
            <NavLink activeClassName="active" to="/segments/customer">
              {__('Customer')}
            </NavLink>
          </li>

          <li>
            <NavLink activeClassName="active" to="/segments/lead">
              {__('Lead')}
            </NavLink>
          </li>

          <li>
            <NavLink activeClassName="active" to="/segments/visitor">
              {__('Visitor')}
            </NavLink>
          </li>

          <li>
            <NavLink activeClassName="active" to="/segments/company">
              {__('Company')}
            </NavLink>
          </li>

          <li>
            <NavLink activeClassName="active" to="/segments/deal">
              {__('Deal')}
            </NavLink>
          </li>

          <li>
            <NavLink activeClassName="active" to="/segments/task">
              {__('Task')}
            </NavLink>
          </li>

          <li>
            <NavLink activeClassName="active" to="/segments/ticket">
              {__('Ticket')}
            </NavLink>
          </li>

          <li>
            <a
              target="_blank"
              href="https://erxes.org/user/segments"
              rel="noopener noreferrer"
            >
              <u> {__('Learn how to create a segment')}</u>
            </a>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default TagsSidebar;
