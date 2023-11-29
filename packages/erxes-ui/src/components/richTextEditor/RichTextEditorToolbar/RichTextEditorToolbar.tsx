import React, { useRef } from 'react';
import { EditorToolbarWrapper } from './styles';

export interface IRichTextEditorToolbarProps {
  /** Determines whether `position: sticky` styles should be added to the toolbar, `false` by default */
  sticky?: boolean;

  /** Sets top style to offset elements with fixed position, `0` by default */
  stickyOffset?: React.CSSProperties['top'];

  children?: React.ReactNode | string;
}

export const RichTextEditorToolbar = (
  props: Partial<IRichTextEditorToolbarProps> = {}
) => {
  const ref = useRef<HTMLDivElement>(null);
  const { sticky = false, stickyOffset, ...others } = props;

  return (
    <EditorToolbarWrapper
      innerRef={ref}
      style={{ position: sticky ? 'sticky' : 'unset' }}
      {...others}
    />
  );
};
