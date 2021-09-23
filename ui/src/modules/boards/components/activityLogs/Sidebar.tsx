import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList } from 'modules/layout/styles';
import React from 'react';
import { NavLink } from 'react-router-dom';
import FormControl from 'modules/common/components/form/Control';
import { SEARCH_ACTIVITY_CHECKBOX } from '../../constants';
import { RowFill, FieldStyle } from '../../styles/common';
import Wrapper from 'modules/layout/components/Wrapper';

const { Section } = Wrapper.Sidebar;

type Props = {
  queryParams?: any;
};

class Sidebar extends React.Component<Props> {
  ListItem(link: string, label: string) {
    return (
      <li>
        <NavLink activeClassName="active" to={link}>
          {__(label)}
        </NavLink>
      </li>
    );
  }

  render() {
    const activityValues = SEARCH_ACTIVITY_CHECKBOX.map(p => ({
      label: p,
      value: p
    }));

    return (
      <LeftSidebar full={true}>
        <LeftSidebar.Header uppercase={true}>
          {__('General')}
        </LeftSidebar.Header>
        <SidebarList id={'ActivitySidebar'}>
          {SEARCH_ACTIVITY_CHECKBOX.map((p, index) => (
            <li key={index}>
              <RowFill>
                <FormControl
                  componentClass="checkbox"
                  options={activityValues}
                  value={activityValues}
                />
                <FieldStyle>{__(p)}</FieldStyle>
              </RowFill>
            </li>
          ))}
          <Section.Title>{__('Due Date')}</Section.Title>
          {this.ListItem('/segments/user', 'Added date')}
          {this.ListItem('/segments/user', 'Changed date')}
          {this.ListItem('/segments/user', 'Removed date')}
          <Section.Title>{__('Assignee')}</Section.Title>
          {this.ListItem('/segments/user', 'Added assignee')}
          {this.ListItem('/segments/user', 'Removed assignee')}
          <Section.Title>{__('Checklist')}</Section.Title>
          {this.ListItem('/segments/user', 'Added checklist')}
          {this.ListItem('/segments/user', 'Updated checklist')}
          {this.ListItem('/segments/user', 'Deleted checklist')}
          <Section.Title>{__('Attachments')}</Section.Title>
          {this.ListItem('/segments/user', 'Added attachments')}
          {this.ListItem('/segments/user', 'Deleted attachments')}
          <Section.Title>{__('Labels')}</Section.Title>
          {this.ListItem('/segments/user', 'Added labels')}
          {this.ListItem('/segments/user', 'Removed labels')}
          <Section.Title>{__('Priority')}</Section.Title>
          {this.ListItem('/segments/user', 'Added priority')}
          {this.ListItem('/segments/user', 'Changed priority')}
        </SidebarList>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
