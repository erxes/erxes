import CollapseContent from 'modules/common/components/CollapseContent';
import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { PROPERTY_GROUPS } from '../constants';

type Props = {
  currentType: string;
  title: string;
};

class Sidebar extends React.Component<Props> {
  renderSidebarHeader = () => {
    const { title } = this.props;
    const { Header } = LeftSidebar;

    return <Header uppercase={true}>{__(title)}</Header>;
  };

  renderSideBar() {
    return PROPERTY_GROUPS.map(group => (
      <CollapseContent key={group.value} title={__(group.label)} compact={true}>
        <List key={`list_${group.value}`}>
          {group.types.map(type => {
            return this.renderListItem(group.value, type.value, type.label);
          })}
        </List>
      </CollapseContent>
    ));
  }

  getClassName(type) {
    const { currentType } = this.props;

    if (type === currentType) {
      return 'active';
    }

    return '';
  }

  renderListItem(group: string, type: string, text: string) {
    return (
      <li key={`${group}_${type}`}>
        <Link to={`?type=${type}`} className={this.getClassName(type)}>
          {__(text)}
        </Link>
      </li>
    );
  }

  render() {
    return (
      <LeftSidebar header={this.renderSidebarHeader()}>
        {this.renderSideBar()}
      </LeftSidebar>
    );
  }
}

export default Sidebar;
