import React, { useRef } from 'react';
import { EditorToolbarWrapper } from './styles';

export interface RichTextEditorToolbarProps {
  /** Determines whether `position: sticky` styles should be added to the toolbar, `false` by default */
  sticky?: boolean;

  /** Sets top style to offset elements with fixed position, `0` by default */
  stickyOffset?: React.CSSProperties['top'];
}

export type RichTextEditorToolbarFactory = {
  props: RichTextEditorToolbarProps;
  ref: HTMLDivElement;
};

const defaultProps: Partial<RichTextEditorToolbarProps> = {};

export const RichTextEditorToolbar = props => {
  const ref = useRef<HTMLDivElement>(null);
  const { sticky = false, stickyOffset, ...others } = props;

  return (
    <EditorToolbarWrapper ref={ref} style={{ position: sticky }} {...others} />
  );
};
