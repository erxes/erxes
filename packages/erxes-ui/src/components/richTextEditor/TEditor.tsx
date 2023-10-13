import React, { useMemo, useRef } from 'react';
import { DEFAULT_LABELS } from './labels';
import { RichTextEditorProvider } from './RichTextEditor.context';
import { RichTextEditorContent } from './RichTextEditorContent/RichTextEditorContent';
import { RichTextEditorControlsGroup } from './RichTextEditorControlsGroup/RichTextEditorControlsGroup';
import { RichTextEditorToolbar } from './RichTextEditorToolbar/RichTextEditorToolbar';
import { RichTextEditorControl } from './RichTextEditorControl/RichTextEditorControl';
import { useEditor } from '@tiptap/react';
import * as controls from './RichTextEditorControl/controls';

import StarterKit from '@tiptap/starter-kit';

export const RichTextEditor = props => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    unstyled,
    vars,
    // editor,
    withCodeHighlightStyles,
    withTypographyStyles,
    labels,
    children,
    ...others
  } = props;

  const mergedLabels = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [
    labels
  ]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<h1> hi </h1>'
  });

  return (
    <RichTextEditorProvider
      value={{
        editor,
        labels: mergedLabels,
        withCodeHighlightStyles,
        withTypographyStyles,
        unstyled
      }}
    >
      <div
        {...others}
        ref={ref}
        style={{
          margin: '0.5rem',
          border: '1px solid #e9ecef',
          borderRadius: '4px'
        }}
      >
        {children}
      </div>
    </RichTextEditorProvider>
  );
};

// Generic components
RichTextEditor.Content = RichTextEditorContent;
RichTextEditor.Control = RichTextEditorControl;
RichTextEditor.Toolbar = RichTextEditorToolbar;
RichTextEditor.ControlsGroup = RichTextEditorControlsGroup;

// Controls components
RichTextEditor.Bold = controls.BoldControl;
RichTextEditor.Italic = controls.ItalicControl;
RichTextEditor.Strikethrough = controls.StrikeThroughControl;
// RichTextEditor.Underline = controls.UnderlineControl;
// RichTextEditor.ClearFormatting = controls.ClearFormattingControl;
RichTextEditor.H1 = controls.H1Control;
RichTextEditor.H2 = controls.H2Control;
RichTextEditor.H3 = controls.H3Control;
// RichTextEditor.H4 = controls.H4Control;
// RichTextEditor.H5 = controls.H5Control;
// RichTextEditor.H6 = controls.H6Control;
RichTextEditor.BulletList = controls.BulletListControl;
RichTextEditor.OrderedList = controls.OrderedListControl;
// RichTextEditor.Link = controls.RichTextEditorLinkControl;
// RichTextEditor.Unlink = controls.UnlinkControl;
// RichTextEditor.Blockquote = controls.BlockquoteControl;
RichTextEditor.AlignLeft = controls.AlignLeftControl;
RichTextEditor.AlignRight = controls.AlignRightControl;
RichTextEditor.AlignCenter = controls.AlignCenterControl;
RichTextEditor.AlignJustify = controls.AlignJustifyControl;
// RichTextEditor.Superscript = controls.SuperscriptControl;
// RichTextEditor.Subscript = controls.SubscriptControl;
// RichTextEditor.Code = controls.CodeControl;
// RichTextEditor.CodeBlock = controls.CodeBlockControl;
// RichTextEditor.ColorPicker = controls.RichTextEditorColorPickerControl;
// RichTextEditor.Color = controls.RichTextEditorColorControl;
// RichTextEditor.Highlight = controls.HighlightControl;
// RichTextEditor.Hr = controls.HrControl;
// RichTextEditor.UnsetColor = controls.UnsetColorControl;
