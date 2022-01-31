import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import { dimensions } from 'modules/common/styles';
import colors from 'modules/common/styles/colors';
import { IOption } from 'modules/common/types';
import * as React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from 'styled-components';
import { __ } from 'erxes-ui/lib/utils/core';

const Wrapper = styled.div`
  padding-right: ${dimensions.coreSpacing}px;

  .dropdown-menu {
    padding: 0;

    .dropdown-list {
      max-height: 300px;
      overflow: auto;
    }

    > h3 {
      padding: ${dimensions.unitSpacing}px
        ${dimensions.coreSpacing + dimensions.unitSpacing}px;
    }
  }
`;

const Trigger = styled.div`
  padding: ${dimensions.unitSpacing / 2}px ${dimensions.unitSpacing * 1.5}px;
  background: ${colors.bgLight};
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing * 1.5}px;
  font-weight: 500;

  &:hover {
    cursor: pointer;
    background: ${colors.bgUnread};
  }

  > i {
    margin-right: ${dimensions.unitSpacing / 2}px;
  }

  > span {
    background: ${colors.colorShadowGray};
    padding: 1px ${dimensions.unitSpacing / 2}px;
    border-radius: ${dimensions.unitSpacing}px;
    font-size: 12px;
    margin-left: ${dimensions.unitSpacing / 2}px;
  }
`;

const ActionItem = styled.div`
  width: 100%;
  text-align: left;
  min-width: 150px;
  background: none;
  outline: 0;
  border: 0;
  overflow: hidden;
  line-height: ${dimensions.coreSpacing}px;
  padding: ${dimensions.unitSpacing / 2}px ${dimensions.unitSpacing * 1.5}px
    ${dimensions.unitSpacing / 2}px ${dimensions.unitSpacing * 3}px;
  position: relative;

  &:hover {
    background: ${colors.bgLight};
    cursor: pointer;
  }

  > i {
    position: absolute;
    left: ${dimensions.unitSpacing}px;
    color: ${colors.colorSecondary};
    float: right;
    top: ${dimensions.unitSpacing / 2}px;
  }
`;

type IProps = {
  onChange: (value: string) => void;
  selectedItems: string[];
  items: IOption[];
  trigger?: React.ReactNode;
};

class BrandChooser extends React.Component<IProps> {
  isChecked = (item: IOption) => {
    const { selectedItems } = this.props;

    return (selectedItems || []).includes(item.value);
  };

  renderTrigger = () => {
    if (this.props.trigger) {
      return this.props.trigger;
    }

    return (
      <Trigger>
        <Icon icon="postcard" /> {__('Brands')}
        <span>{this.props.selectedItems.length}</span>
      </Trigger>
    );
  };

  render() {
    const { items, onChange } = this.props;

    const onChangeItem = (value: string) => onChange(value);

    return (
      <Wrapper>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-brand">
            {this.renderTrigger()}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <h3 className="popover-header">{__('Choose a brand')}</h3>
            <div className="dropdown-list">
              {items.map((item: IOption) => (
                <li key={item.value}>
                  <ActionItem onClick={onChangeItem.bind(this, item.value)}>
                    {item.label}
                    {this.isChecked(item) && <Icon icon="check-1" />}
                  </ActionItem>
                </li>
              ))}
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </Wrapper>
    );
  }
}

export default BrandChooser;
