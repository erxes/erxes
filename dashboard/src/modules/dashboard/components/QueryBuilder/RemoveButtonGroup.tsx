import { Icon } from '@ant-design/compatible';
import { Button } from 'antd';
import React from 'react';

const RemoveButtonGroup = ({ onRemoveClick, children, ...props }) => (
  <Button.Group
    {...props}
  >
    {children}
    <Button type="dashed" onClick={onRemoveClick} shape="round">
      <Icon type="close" />
    </Button>
  </Button.Group>
);

export default RemoveButtonGroup;
