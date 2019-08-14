import PriorityIndicator from 'modules/boards/components/editForm/PriorityIndicator';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import colors from 'modules/common/styles/colors';
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
  onChange: (value: string) => void;
  currentItem?: string;
  items: string[];
  trigger: React.ReactNode;
};

class SelectItem extends React.Component<IProps> {
  render() {
    const { currentItem, onChange, items, trigger } = this.props;

    const onChangeItem = (value: string) =>
      onChange(currentItem === value ? '' : value);

    return (
      <Dropdown id="dropdown">
        <DropdownToggle bsRole="toggle">{trigger}</DropdownToggle>
        <Dropdown.Menu>
          {items.map(item => (
            <li key={item}>
              <ActionItem onClick={onChangeItem.bind(this, item)}>
                <PriorityIndicator value={item} /> {item}
                {currentItem === item && <Icon icon="check-1" />}
              </ActionItem>
            </li>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default SelectItem;
