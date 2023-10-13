import React, { useRef } from 'react';
import { ControlsGroupWrapper } from './styles';

export type RichTextEditorControlsGroupFactory = {
  props: any;
  ref: HTMLDivElement;
};

export const RichTextEditorControlsGroup = props => {
  const ref = useRef<HTMLDivElement>(null);
  return <ControlsGroupWrapper ref={ref} {...props} />;
};
