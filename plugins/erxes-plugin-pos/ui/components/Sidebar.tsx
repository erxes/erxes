import {
    __, Button, MainStyleTopHeader as TopHeader, Sidebar as LeftSidebar, SidebarList as List
  } from 'erxes-ui';
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
              btnStyle="primary"
              icon=""
              block={true}
              uppercase={false}
            >
              New POS
            </Button>
          </Link>
        </TopHeader>
      );
    }
  
    render() {
      return (
        <LeftSidebar full={true} header={this.renderSidebarHeader()}>
            <></>
        </LeftSidebar>
      );
    }
  }
  
  export default Sidebar;
  