// import CollapseContent from "modules/common/components/CollapseContent";
import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { PROPERTY_GROUPS } from '../constants';
import { TopHeader } from 'modules/common/styles/main';
import { PropertyGroup } from '../styles';

type Props = {
  currentType: string;
  title: string;
};

class Sidebar extends React.Component<Props> {
  renderSidebarHeader = () => {
    const { title } = this.props;
    const { Header } = LeftSidebar;

    return (
      <>
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
        <Header uppercase={true}>{__(title)}</Header>
      </>
    );
  };

  renderListItem(group: string, type: string, text: string) {
    const className = this.props.currentType === type ? 'active' : '';

    return (
      <li key={`${group}_${type}`}>
        <Link to={`?type=${type}`} className={className}>
          {__(text)}
        </Link>
      </li>
    );
  }

  renderSideBar() {
    return PROPERTY_GROUPS.map(group => (
      <PropertyGroup key={group.value}>
        <h4>{group.value}</h4>
        <List key={`list_${group.value}`}>
          {group.types.map(type => {
            return this.renderListItem(group.value, type.value, type.label);
          })}
        </List>
      </PropertyGroup>
    ));
  }

  render() {
    return (
      <LeftSidebar header={this.renderSidebarHeader()} full={true}>
        {this.renderSideBar()}
      </LeftSidebar>
    );
  }
}

export default Sidebar;
