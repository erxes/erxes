import React, { useRef } from 'react';
import { ControlsGroupWrapper } from './styles';

export interface IRichTextEditorControlsGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const RichTextEditorControlsGroup = (
  props: IRichTextEditorControlsGroupProps
) => {
  const ref = useRef<HTMLDivElement>(null);
  return <ControlsGroupWrapper innerRef={ref} {...props} />;
};
