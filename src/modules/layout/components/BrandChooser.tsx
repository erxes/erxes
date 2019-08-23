import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import colors from 'modules/common/styles/colors';
import { IOption } from 'modules/common/types';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';

export const ActionItem = styled.button`
  width: 100%;
  text-align: left;
  min-width: 150px;
  background: none;
  outline: 0;
  border: 0;
  overflow: hidden;

  > i {
    color: ${colors.colorCoreGreen};
    float: right;
  }
`;

type IProps = {
  onChange?: (value: string) => void;
  selectedItems: string[];
  items: IOption[];
  trigger: React.ReactNode;
};

class BrandChooser extends React.Component<IProps> {
  isChecked = (item: IOption) => {
    const { selectedItems } = this.props;

    return (selectedItems || []).includes(item.value);
  };

  render() {
    const { items, trigger } = this.props;

    return (
      <Dropdown id="dropdown">
        <DropdownToggle bsRole="toggle">{trigger}</DropdownToggle>
        <Dropdown.Menu>
          {items.map((item: IOption) => (
            <li key={item.value}>
              <ActionItem>
                {item.label}
                {this.isChecked(item) && <Icon icon="check-1" />}
              </ActionItem>
            </li>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default BrandChooser;
