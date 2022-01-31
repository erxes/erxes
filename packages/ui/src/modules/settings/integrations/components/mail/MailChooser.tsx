import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import { dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import colors from 'modules/common/styles/colors';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IIntegration } from '../../types';

const Wrapper = styled.div`
  .dropdown-menu {
    max-height: 280px;
    overflow: auto;
  }
`;

const Trigger = styledTS<{ disabled?: boolean }>(styled.div)`
  padding: 1px 5px;
  background: ${props =>
    props.disabled ? rgba(colors.colorCoreRed, 0.2) : colors.bgActive};
  border-radius: 4px;
  line-height: 18px;

  &:hover {
    background: ${props => !props.disabled && colors.bgMain};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  }
`;

const ActionItem = styledTS<{ selected?: boolean }>(styled.div)`
  width: 100%;
  text-align: left;
  min-width: 160px;
  background: none;
  outline: 0;
  border: 0;
  overflow: hidden;
  line-height: ${dimensions.coreSpacing}px;
  padding: ${dimensions.unitSpacing / 2}px ${dimensions.coreSpacing}px;
  display: flex;
  justify-content: space-between;
  font-weight: ${props => props.selected && '600'};
  max-width: 300px;
  
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    i {
      margin-right: ${dimensions.unitSpacing}px;
      color: ${colors.colorCoreLightGray};
    }
  }
	
	> i {
		color: ${colors.colorPrimaryDark};
    font-size: 16px;
    margin-left: ${dimensions.unitSpacing}px;
	}

  &:hover {
    background: ${colors.bgActive};
    cursor: pointer;
  }
`;

type Props = {
  onChange: (value: string) => void;
  selectedItem?: string;
  integrations: IIntegration[];
};

class MailChooser extends React.Component<Props> {
  isChecked = (item: IIntegration) => {
    const { selectedItem } = this.props;

    return selectedItem === item._id;
  };

  renderTrigger = () => {
    const { integrations, selectedItem } = this.props;

    const integration = integrations.find(obj => obj._id === selectedItem);
    const isEmpty = integrations.length === 0;

    return (
      <Trigger disabled={isEmpty}>
        {isEmpty ? __('No connected email') : integration && integration.name}
      </Trigger>
    );
  };

  renderMenu = () => {
    const { integrations } = this.props;

    if (integrations.length === 0) {
      return;
    }

    const { onChange } = this.props;
    const onChangeItem = (value: string) => onChange(value);

    return (
      <Dropdown.Menu>
        {integrations.map((item: IIntegration) => (
          <ActionItem
            key={item._id}
            onClick={onChangeItem.bind(this, item._id)}
            selected={this.isChecked(item)}
          >
            <span>
              <Icon icon="mail-alt" />
              {item.name}
            </span>
            {this.isChecked(item) && <Icon icon="check-1" />}
          </ActionItem>
        ))}
      </Dropdown.Menu>
    );
  };

  render() {
    return (
      <Wrapper>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-mail">
            {this.renderTrigger()}
          </Dropdown.Toggle>
          {this.renderMenu()}
        </Dropdown>
      </Wrapper>
    );
  }
}

export default MailChooser;
