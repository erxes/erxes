import { Menu } from 'antd';
import React from 'react';
import ButtonDropdown from './ButtonDropdown'; // Can't be a Pure Component due to Dropdown lookups overlay component type to set appropriate styles

const memberMenu = (onClick, availableMembers) => (
  <Menu>
    {availableMembers.length ? (
      availableMembers.map(m => (
        <Menu.Item key={m.name} onClick={() => onClick(m)}>
          {m.title}
        </Menu.Item>
      ))
    ) : (
      <Menu.Item disabled={true}>No members found</Menu.Item>
    )}
  </Menu>
);

const MemberDropdown = ({ onClick, availableMembers, ...buttonProps }) => (
  <ButtonDropdown
    overlay={memberMenu(onClick, availableMembers)}
    {...buttonProps}
  />
);

export default MemberDropdown;
