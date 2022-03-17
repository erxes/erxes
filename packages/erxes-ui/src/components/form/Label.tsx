import { __ } from '../../utils/core';
import React from 'react';
import { Label } from './styles';

type Props = {
  children: React.ReactNode | string;
  ignoreTrans?: boolean;
  htmlFor?: string;
  required?: boolean;
  uppercase?: boolean;
  bold?: boolean;
};

function ControlLabel(props: Props) {
  const { children, ignoreTrans, required, uppercase = true, bold = false } = props;

  let content = children;

  if (!ignoreTrans && typeof children === 'string') {
    content = __(children);
  }

  return (
    <Label uppercase={uppercase} bold={bold}>
      {content}
      {required && <span> *</span>}
    </Label>
  );
}

export default ControlLabel;
