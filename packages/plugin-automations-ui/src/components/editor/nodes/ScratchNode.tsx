import React from 'react';
import { ScratchNode as CommonScratchNode } from '../styles';

import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils/core';
import { NodeProps } from '../types';

const ScratchNode = ({ data }: NodeProps) => {
  const { toggleDrawer } = data;

  return (
    <CommonScratchNode onClick={toggleDrawer.bind(this, { type: 'triggers' })}>
      <Icon icon="file-plus" size={25} />
      <p>{__('How do you want to trigger this automation')}?</p>
    </CommonScratchNode>
  );
};

export default ScratchNode;
