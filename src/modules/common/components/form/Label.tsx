import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Label } from './styles';

type Props = {
  children: string,
  ignoreTrans: boolean
};

function ControlLabel(props: Props) {
  const { children, ignoreTrans } = props;

  return <Label>{ignoreTrans ? children : __(children)}</Label>;
}

export default ControlLabel;
