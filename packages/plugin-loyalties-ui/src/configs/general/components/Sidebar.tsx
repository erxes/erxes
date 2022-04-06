import { __ } from '@erxes/ui/src/utils';
import { Button } from '@erxes/ui/src/components';
import {  MainStyleTopHeader as TopHeader } from '@erxes/ui/src/styles/eindex';
import { Sidebar as LeftSidebar, SidebarList as List } from '@erxes/ui/src/layout';
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
            '/erxes-plugin-loyalty/settings/general',
            'General config'
          )}
          {this.renderListItem(
            '/erxes-plugin-loyalty/settings/voucher',
            'Voucher'
          )}
          {this.renderListItem(
            '/erxes-plugin-loyalty/settings/lottery',
            'Lottery'
          )}
          {this.renderListItem(
            '/erxes-plugin-loyalty/settings/spin',
            'Spin'
          )}
          {this.renderListItem(
            '/erxes-plugin-loyalty/settings/donate',
            'Donate'
          )}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;