import {
  __,
  Button,
  MainStyleTopHeader as TopHeader,
  Sidebar as LeftSidebar,
  SidebarList as List
} from '@erxes/ui/src';
import React from 'react';
import { Link } from 'react-router-dom';

class Sidebar extends React.Component {
  renderListItem(url: string, text: string) {
    return (
      <li>
        <Link
          to={url}
          className={window.location.href.includes(url) ? 'active' : ''}
        >
          {__(text)}
        </Link>
      </li>
    );
  }

  renderSidebarHeader() {
    return (
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
    );
  }

  render() {
    return (
      <LeftSidebar full={true} header={this.renderSidebarHeader()}>
        <List id="SettingsSidebar">
          {this.renderListItem(
            '/erxes-plugin-loan/undue-settings',
            'Loan not calc undue settings'
          )}
          {this.renderListItem(
            '/erxes-plugin-loan/holiday-settings',
            'Holiday configure'
          )}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
