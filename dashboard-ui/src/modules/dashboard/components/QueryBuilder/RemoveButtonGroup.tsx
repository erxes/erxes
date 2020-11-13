import { Button } from 'antd';
import Icon from 'modules/common/components/Icon';
import React from 'react';

const RemoveButtonGroup = ({ onRemoveClick, children, ...props }) => (
  <Button.Group
    {...props}
  >
    {children}
    <Button type="dashed" onClick={onRemoveClick} shape="round">
      <Icon icon="times" />
    </Button>
  </Button.Group>
);

export default RemoveButtonGroup;
