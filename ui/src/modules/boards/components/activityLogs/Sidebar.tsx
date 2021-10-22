import { __, router } from 'modules/common/utils';
import { SidebarList } from 'modules/layout/styles';
import React from 'react';
import { withRouter } from 'react-router-dom';
import FormControl from 'modules/common/components/form/Control';
import { SEARCH_ACTIVITY_CHECKBOX } from '../../constants';
import { RowFill, FieldStyle } from '../../styles/viewtype';
import Wrapper from 'modules/layout/components/Wrapper';
import { IRouterProps } from 'modules/common/types';
import Icon from 'modules/common/components/Icon';

const { Section } = Wrapper.Sidebar;

type Props = {
  queryParams?: any;
  isChecked?: boolean;
} & IRouterProps;

type State = {
  page?: string;
  perPage?: string;
};

class Sidebar extends React.Component<Props, State> {
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

    for (const checkbox of checkboxes) {
      if (checkbox.checked) {
        action.push(checkbox.value);
      }
    }

    router.setParams(history, { action: action.toString() });
  };

  onChangeAll = e => {
    const { history } = this.props;

    router.setParams(history, {
      action: e.target.checked
        ? SEARCH_ACTIVITY_CHECKBOX.map(a => a.action).toString()
        : ''
    });
  };

  render() {
    const { isChecked } = this.props;
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
          <li key="0">
            <label>
              <RowFill>
                <FormControl
                  componentClass="checkbox"
                  options={activityValues}
                  onChange={this.onChangeAll}
                  checked={actionQP.split(',').length === 5}
                />
                <FieldStyle>All</FieldStyle>
              </RowFill>
            </label>
          </li>
          {SEARCH_ACTIVITY_CHECKBOX.map(({ action, value }, index) => (
            <li key={index}>
              <label>
                <RowFill>
                  <FormControl
                    componentClass="checkbox"
                    name="activityLogViewGeneral"
                    options={activityValues}
                    value={action}
                    onChange={this.onChange}
                    checked={actionQP.includes(action)}
                    defaultChecked={isChecked}
                  />
                  <FieldStyle>{value}</FieldStyle>
                </RowFill>
              </label>
            </li>
          ))}
        </SidebarList>
      </Wrapper.Sidebar>
    );
  }
}

export default withRouter(Sidebar);
