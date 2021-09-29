import { __, router } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList } from 'modules/layout/styles';
import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import FormControl from 'modules/common/components/form/Control';
import { SEARCH_ACTIVITY_CHECKBOX } from '../../constants';
import { RowFill, FieldStyle } from '../../styles/viewtype';
import Wrapper from 'modules/layout/components/Wrapper';
import { IRouterProps } from 'modules/common/types';

const { Section } = Wrapper.Sidebar;

type Props = {
  queryParams?: any;
  isChecked?: boolean;
} & IRouterProps;

type State = {
  action?: string;
  contentType?: string;
  page?: string;
  perPage?: string;
};

class Sidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const qp = props.queryParams || {
      action: '',
      contentType: ''
    };

    this.state = {
      action: qp.action,
      contentType: qp.contentType
    };
  }

  ListItem(link: string, label: string) {
    return (
      <li>
        <NavLink activeClassName="active" to={link}>
          {__(label)}
        </NavLink>
      </li>
    );
  }

  onChange = e => {
    const { history } = this.props;

    const action = e.target.checked ? e.target.value : null;

    this.setState({ action });

    router.setParams(history, { action });
  };

  render() {
    const activityValues = SEARCH_ACTIVITY_CHECKBOX.map(p => ({
      label: p,
      value: p
    }));

    const { isChecked } = this.props;

    return (
      <LeftSidebar full={true}>
        <LeftSidebar.Header uppercase={true}>
          {__('General')}
        </LeftSidebar.Header>
        <SidebarList id={'ActivitySidebar'}>
          {SEARCH_ACTIVITY_CHECKBOX.map(({ action, value }, index) => (
            <li key={index}>
              <RowFill>
                <FormControl
                  componentClass="checkbox"
                  options={activityValues}
                  value={action}
                  onChange={this.onChange}
                  checked={isChecked}
                />
                <FieldStyle>{value}</FieldStyle>
              </RowFill>
            </li>
          ))}
          <Section.Title>{__('Due Date')}</Section.Title>
          {this.ListItem(`/segments/user`, 'Added date')}
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

export default withRouter(Sidebar);
