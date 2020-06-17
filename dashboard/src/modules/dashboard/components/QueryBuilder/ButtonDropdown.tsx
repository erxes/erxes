import { Button, Dropdown } from 'antd';
import React from 'react';

const ButtonDropdown = ({ overlay, ...buttonProps }) => (
  <Dropdown overlay={overlay} placement="bottomLeft" trigger={['click']}>
    <Button {...buttonProps} shape="round" />
  </Dropdown>
);

export default ButtonDropdown;
