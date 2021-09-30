import { __, router } from 'modules/common/utils';
import { SidebarList } from 'modules/layout/styles';
import React from 'react';
import { withRouter } from 'react-router-dom';
import FormControl from 'modules/common/components/form/Control';
import { SEARCH_ACTIVITY_CHECKBOX } from '../../constants';
import { RowFill, FieldStyle } from '../../styles/viewtype';
import Wrapper from 'modules/layout/components/Wrapper';
import { IRouterProps } from 'modules/common/types';
import Box from 'modules/common/components/Box';
import Icon from 'modules/common/components/Icon';

const { Section } = Wrapper.Sidebar;

type Props = {
  queryParams?: any;
  isChecked?: boolean;
} & IRouterProps;

type State = {
  contentType?: string;
  page?: string;
  perPage?: string;
};

class Sidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const qp = props.queryParams || {
      contentType: ''
    };

    this.state = {
      contentType: qp.contentType
    };
  }

  ListItem(key: string, value: string, label: string) {
    const { history, queryParams } = this.props;

    const onClick = () => {
      router.setParams(history, { [key]: value });
    };

    return (
      <li>
        <a
          href="#filter"
          className={queryParams[key] === value ? 'active' : ''}
          onClick={onClick}
        >
          {__(label)}
        </a>
      </li>
    );
  }

  clearItem(key: string) {
    const { history } = this.props;

    const onClear = () => {
      router.setParams(history, { [key]: null });
    };

    if (router.getParam(history, [key])) {
      return (
        <a href="#cancel" tabIndex={0} onClick={onClear}>
          <Icon icon="times-circle" />
        </a>
      );
    }

    return null;
  }

  onChange = () => {
    const { history } = this.props;

    const checkboxes: any = document.getElementsByName(
      'activityLogViewGeneral'
    );

    const action: any = [];

    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        action.push(checkboxes[i].value);
      }
    }

    router.setParams(history, { action: action.toString() });
  };

  render() {
    const activityValues = SEARCH_ACTIVITY_CHECKBOX.map(p => ({
      label: p,
      value: p
    }));

    const actionQP: string = (this.props.queryParams || {}).action || '';

    return (
      <Wrapper.Sidebar>
        <Section.Title>{__('General')}</Section.Title>
        <SidebarList
          id={'checkboxList'}
          style={{
            backgroundColor: 'white',
            marginBottom: '10px',
            padding: '10px 0'
          }}
        >
          {SEARCH_ACTIVITY_CHECKBOX.map(({ action, value }, index) => (
            <li key={index}>
              <RowFill>
                <FormControl
                  componentClass="checkbox"
                  name="activityLogViewGeneral"
                  options={activityValues}
                  value={action}
                  onChange={this.onChange}
                  checked={actionQP.includes(action)}
                />
                <FieldStyle>{value}</FieldStyle>
              </RowFill>
            </li>
          ))}
        </SidebarList>
        <Box
          extraButtons={this.clearItem('assignee')}
          title={__('Assignee')}
          name="showByAssignee"
          isOpen={true}
        >
          <SidebarList>
            {this.ListItem('assignee', 'added', 'Added assignee')}
            {this.ListItem('assignee', 'removed', 'Removed assignee')}
          </SidebarList>
        </Box>
        <Box
          extraButtons={this.clearItem('label')}
          title={__('Labels')}
          name="showLabal"
          isOpen={true}
        >
          <SidebarList>
            {this.ListItem('label', 'added', 'Added labels')}
            {this.ListItem('label', 'removed', 'Removed labels')}
          </SidebarList>
        </Box>
        <Box
          extraButtons={this.clearItem('attachment')}
          title={__('Attachments')}
          name="showAttachments"
        >
          <SidebarList>
            {this.ListItem('attachment', 'added', 'Added attachments')}
            {this.ListItem('attachment', 'deleted', 'Deleted attachments')}
          </SidebarList>
        </Box>
        <Box
          extraButtons={this.clearItem('checklist')}
          title={__('Checklist')}
          name="showByAssignee"
        >
          <SidebarList>
            {this.ListItem('checklist', 'added', 'Added checklist')}
            {this.ListItem('checklist', 'updated', 'Updated checklist')}
            {this.ListItem('checklist', 'deleted', 'Deleted checklist')}
          </SidebarList>
        </Box>
        <Box
          extraButtons={this.clearItem('dueDate')}
          title={__('Due Date')}
          name="showByDueDate"
        >
          <SidebarList>
            {this.ListItem('dueDate', 'added', 'Added date')}
            {this.ListItem('dueDate', 'changed', 'Changed date')}
            {this.ListItem('dueDate', 'removed', 'Removed date')}
          </SidebarList>
        </Box>
        <Box
          extraButtons={this.clearItem('priority')}
          title={__('Priority')}
          name="showPriority"
        >
          <SidebarList>
            {this.ListItem('priority', 'added', 'Added priority')}
            {this.ListItem('priority', 'changed', 'Changed priority')}
          </SidebarList>
        </Box>
      </Wrapper.Sidebar>
    );
  }
}

export default withRouter(Sidebar);
