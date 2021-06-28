import { __ } from 'modules/common/utils';
import { PLACEHOLDER, ROLE_OPTIONS, ROLE_VALUE } from 'modules/robot/constants';
import React from 'react';
import Select from 'react-select-plus';
import { selectOptions } from '../../utils';
import { Container, SubContent } from '../styles';
import { IRoleValue } from 'modules/robot/types';
import { Tooltip } from 'antd';
import Icon from 'modules/common/components/Icon';

type Props = {
  renderButton: (
    text: string,
    onClick,
    icon: string,
    disabled: boolean
  ) => React.ReactNode;
  changeRoute: (route: string) => void;
  getRoleOptions: (roleValue: IRoleValue) => void;
  roleValue: IRoleValue;
};

type State = {
  step: number;
  selectedRole: string;
  selectedValue: string;
};

class Roles extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      step: 1,
      selectedRole: this.props.roleValue.value || '',
      selectedValue: ''
    };
  }

  onChange = (key: string, value: IRoleValue) => {
    this.setState({ [key]: value } as any);
    if (key === 'selectedRole') {
      this.props.getRoleOptions(value);
      if (key && value) {
        localStorage.setItem(key, value.value);
      }
    }
    if (key === 'selectedValue') {
      if (key && value) {
        localStorage.setItem(key, value.value);
      }
    }
  };

  render() {
    const { renderButton, changeRoute } = this.props;
    const { selectedRole, selectedValue } = this.state;

    const selectedRoleOnChange = value => this.onChange('selectedRole', value);
    const selectedValueOnChange = value =>
      this.onChange('selectedValue', value);

    return (
      <Container>
        <SubContent>
          <h4>{__('Your Role')}</h4>
        </SubContent>

        <p>
          {__("What's your main area of work")}?{' '}
          <Tooltip placement="right" title="why does not work ?????">
            <Icon icon="icon-info-circle" />
          </Tooltip>
        </p>
        <Select
          value={selectedRole}
          onChange={selectedRoleOnChange}
          placeholder={PLACEHOLDER}
          options={selectOptions(ROLE_OPTIONS)}
        />

        <p>{__('Which of these sounds most like you')}?</p>
        <Select
          value={selectedValue}
          onChange={selectedValueOnChange}
          placeholder={PLACEHOLDER}
          options={selectOptions(ROLE_VALUE)}
        />

        {renderButton(
          'Next',
          () => changeRoute('setupList'),
          'arrow-circle-right',
          !selectedRole || !selectedValue ? true : false
        )}
      </Container>
    );
  }
}

export default Roles;
