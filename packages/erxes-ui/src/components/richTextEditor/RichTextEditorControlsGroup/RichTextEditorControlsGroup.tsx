import React, { useRef } from 'react';
import { ControlsGroupWrapper } from './styles';

export interface RichTextEditorControlsGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const RichTextEditorControlsGroup = (
  props: RichTextEditorControlsGroupProps
) => {
  const ref = useRef<HTMLDivElement>(null);
  return <ControlsGroupWrapper innerRef={ref} {...props} />;
};
