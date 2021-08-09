import { __ } from 'modules/common/utils';
import {
  PLACEHOLDER,
  ROLE_OPTIONS,
  ROLE_VALUE,
  TOOLTIP
} from 'modules/robot/constants';
import React from 'react';
import Select from 'react-select-plus';
import { selectOptions } from '../../utils';
import { Container, SubContent } from '../styles';
import { IRoleValue } from 'modules/robot/types';
import Tip from 'modules/common/components/Tip';
import Icon from 'modules/common/components/Icon';
import styled from 'styled-components';

const SelectUp = styled.div`
  .Select-menu-outer {
    position: absolute;
    top: auto;
    bottom: calc(100% - 1px);
  }
`;

type Props = {
  renderButton: (
    text: string,
    onClick,
    icon: string,
    disabled: boolean
  ) => React.ReactNode;
  changeRoute: (route: string) => void;
  getRoleOptions: (roleValue: IRoleValue) => void;
  getAnswerOf: (answerOf: IRoleValue) => void;
  roleValue: IRoleValue;
  answerOf: IRoleValue;
  toggleContent: (isShow: boolean) => void;
};

type State = {
  step: number;
  selectedRole: string;
  selectedAnswer: string;
};

class Roles extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      step: 1,
      selectedRole: this.props.roleValue.value || '',
      selectedAnswer: this.props.answerOf.value || ''
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
    if (key === 'selectedAnswer') {
      this.props.getAnswerOf(value);
      if (key && value) {
        localStorage.setItem(key, value.value);
      }
    }
  };

  render() {
    const { renderButton, changeRoute } = this.props;
    const { selectedRole, selectedAnswer } = this.state;

    const selectedRoleOnChange = value => this.onChange('selectedRole', value);
    const selectedAnswerOnChange = value =>
      this.onChange('selectedAnswer', value);

    return (
      <Container>
        <SubContent>
          <h4>{__('Your Role')}</h4>
        </SubContent>

        <p>
          {__("What's your main area of work")}?{' '}
          <Tip placement="left-end" text={__(TOOLTIP)}>
            <Icon icon="info-circle" color="hsl(259,50%,51.9%)" />
          </Tip>
        </p>
        <Select
          value={selectedRole}
          onChange={selectedRoleOnChange}
          placeholder={__(PLACEHOLDER)}
          options={selectOptions(ROLE_OPTIONS)}
        />

        <p>{__('Which of these sounds the most like you')}?</p>
        <SelectUp>
          <Select
            value={selectedAnswer}
            onChange={selectedAnswerOnChange}
            placeholder={__(PLACEHOLDER)}
            options={selectOptions(ROLE_VALUE)}
          />
        </SelectUp>
        {renderButton(
          'Next',
          () => changeRoute('setupList'),
          'arrow-circle-right',
          !selectedRole || !selectedAnswer ? true : false
        )}
      </Container>
    );
  }
}

export default Roles;
