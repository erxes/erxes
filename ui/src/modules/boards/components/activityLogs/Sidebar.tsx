import { __, router } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
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
    const { history } = this.props;

    const activityValues = SEARCH_ACTIVITY_CHECKBOX.map(p => ({
      label: p,
      value: p
    }));

    const onClear = () => {
      router.setParams(history, { dueDate: null });
    };

    const extraButtons = router.getParam(history, 'dueDate') && (
      <a href="#cancel" tabIndex={0} onClick={onClear}>
        <Icon icon="times-circle" />
      </a>
    );

    const actionQP: string = (this.props.queryParams || {}).action || '';

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
          <Box
            extraButtons={extraButtons}
            title={__('Due Date')}
            name="showByDueDate"
            isOpen={true}
          >
            {this.ListItem('dueDate', 'added', 'Added date')}
            {this.ListItem('dueDate', 'changed', 'Changed date')}
            {this.ListItem('dueDate', 'removed', 'Removed date')}
          </Box>
          <Section.Title>{__('Assignee')}</Section.Title>
          {this.ListItem('assignee', 'added', 'Added assignee')}
          {this.ListItem('assignee', 'removed', 'Removed assignee')}
          <Section.Title>{__('Checklist')}</Section.Title>
          {this.ListItem('checklist', 'added', 'Added checklist')}
          {this.ListItem('checklist', 'updated', 'Updated checklist')}
          {this.ListItem('checklist', 'deleted', 'Deleted checklist')}
          <Section.Title>{__('Attachments')}</Section.Title>
          {this.ListItem('attachment', 'added', 'Added attachments')}
          {this.ListItem('attachment', 'deleted', 'Deleted attachments')}
          <Section.Title>{__('Labels')}</Section.Title>
          {this.ListItem('label', 'added', 'Added labels')}
          {this.ListItem('label', 'removed', 'Removed labels')}
          <Section.Title>{__('Priority')}</Section.Title>
          {this.ListItem('priority', 'added', 'Added priority')}
          {this.ListItem('priority', 'changed', 'Changed priority')}
        </SidebarList>
      </LeftSidebar>
    );
  }
}

export default withRouter(Sidebar);
