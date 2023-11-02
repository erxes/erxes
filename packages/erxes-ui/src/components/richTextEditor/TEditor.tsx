import React, { useEffect, useMemo, useRef } from 'react';
import { DEFAULT_LABELS, RichTextEditorLabels } from './labels';
import { RichTextEditorProvider } from './RichTextEditor.context';
import { RichTextEditorContent } from './RichTextEditorContent/RichTextEditorContent';
import { RichTextEditorControlsGroup } from './RichTextEditorControlsGroup/RichTextEditorControlsGroup';
import { RichTextEditorToolbar } from './RichTextEditorToolbar/RichTextEditorToolbar';
import { RichTextEditorControl } from './RichTextEditorControl/RichTextEditorControl';

import * as controls from './RichTextEditorControl/controls';

import {
  RichTextEditorFontControl,
  RichTextEditorLinkControl
} from './RichTextEditorControl';
import { useEditor } from '@tiptap/react';
import useExtensions from './hooks/useExtensions';

type toolbarLocationOption = 'bottom' | 'top';
export interface RichTextEditorProps {
  /** Controlled value */
  content: string;

  /** Exposing editor onChange to outer component via props */
  onChange?: (editorHtml: string) => void;
  labels?: RichTextEditorLabels;
  toolbarLocation?: toolbarLocationOption;
}

export const RichTextEditor = (props: RichTextEditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { content, onChange, labels } = props;

  const mergedLabels = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [
    labels
  ]);

  const handleEditorChange = ({ editor }) => {
    if (onChange) {
      onChange(editor.getHTML());
    }
  };

  const extensions = useExtensions({
    placeholder: 'Custom placeholder...'
  });

  const editor = useEditor({
    extensions,
    content,
    parseOptions: { preserveWhitespace: 'full' },
    onUpdate: handleEditorChange
  });

  useEffect(() => {
    if (!editor) return;
    let { from, to } = editor.state.selection;
    editor.commands.setContent(content, false, {
      preserveWhitespace: true
    });
    editor.commands.setTextSelection({ from, to });
  }, [editor, content]);

  return (
    <RichTextEditorProvider
      value={{
        editor,
        labels: mergedLabels
      }}
    >
      <div
        // {...others}
        ref={ref}
        style={{
          position: 'relative',
          background: '#fff',
          overflowY: 'hidden',
          minHeight: 350,
          margin: '0.5rem',
          border: '1px solid #e9ecef',
          borderRadius: '4px'
        }}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            {/* <RichTextEditor.Underline /> */}
            <RichTextEditor.Strikethrough />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.FontSize />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignRight />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditorContent />
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
RichTextEditor.Link = RichTextEditorLinkControl;
RichTextEditor.Unlink = controls.UnlinkControl;
// RichTextEditor.Blockquote = controls.BlockquoteControl;
RichTextEditor.AlignLeft = controls.AlignLeftControl;
RichTextEditor.AlignRight = controls.AlignRightControl;
RichTextEditor.AlignCenter = controls.AlignCenterControl;
RichTextEditor.AlignJustify = controls.AlignJustifyControl;

RichTextEditor.FontSize = RichTextEditorFontControl;

// RichTextEditor.Superscript = controls.SuperscriptControl;
// RichTextEditor.Subscript = controls.SubscriptControl;
// RichTextEditor.Code = controls.CodeControl;
// RichTextEditor.CodeBlock = controls.CodeBlockControl;
// RichTextEditor.ColorPicker = controls.RichTextEditorColorPickerControl;
// RichTextEditor.Color = controls.RichTextEditorColorControl;
// RichTextEditor.Highlight = controls.HighlightControl;
// RichTextEditor.Hr = controls.HrControl;
// RichTextEditor.UnsetColor = controls.UnsetColorControl;
