import Button from 'modules/common/components/Button';
import { TopHeader } from 'modules/common/styles/main';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  dashboardId: string;
};

class Sidebar extends React.Component<Props> {
  renderListItem(url: string, text: string, isAll: boolean) {
    if (!isAll) {
      return (
        <li>
          <Link
            to={url}
            className={window.location.href.includes(url) ? 'active' : ''}
          >
            {text}
          </Link>
        </li>
      );
    }

    return (
      <li>
        <Link
          to={url}
          className={window.location.href.includes('?type') ? '' : 'active'}
        >
          {text}
        </Link>
      </li>
    );
  }

  renderSidebarHeader() {
    return (
      <TopHeader>
        <Link to="/dashboard">
          <Button
            btnStyle="simple"
            icon="arrow-circle-left"
            block={true}
            uppercase={false}
          >
            Back to Dashboard
          </Button>
        </Link>
      </TopHeader>
    );
  }

  render() {
    const { dashboardId } = this.props;

    return (
      <LeftSidebar full={true} header={this.renderSidebarHeader()}>
        <List>
          {this.renderListItem(
            `/dashboard/reports/${dashboardId}`,
            'All',
            true
          )}
          {this.renderListItem(
            `/dashboard/reports/${dashboardId}?type=customers`,
            'Customers',
            false
          )}

          {this.renderListItem(
            `/dashboard/reports/${dashboardId}?type=conversations`,
            'Conversation',
            false
          )}
          {this.renderListItem(
            `/dashboard/reports/${dashboardId}?type=deals`,
            'Deal',
            false
          )}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
