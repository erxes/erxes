import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Label } from './styles';

type Props = {
  children: React.ReactNode | string;
  ignoreTrans?: boolean;
  htmlFor?: string;
  required?: boolean;
};

function ControlLabel(props: Props) {
  const { children, ignoreTrans, required } = props;

  let content = children;

  if (!ignoreTrans && typeof children === 'string') {
    content = __(children);
  }

  return (
    <Label>
      {content}
      {required && <span> *</span>}
    </Label>
  );
}

export default ControlLabel;
