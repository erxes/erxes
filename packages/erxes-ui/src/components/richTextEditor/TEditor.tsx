import React, { useEffect, useMemo, useRef } from 'react';
import { DEFAULT_LABELS, RichTextEditorLabels } from './labels';
import { RichTextEditorProvider } from './RichTextEditor.context';
import {
  RichTextEditorContent,
  RichTextEditorContentProps
} from './RichTextEditorContent/RichTextEditorContent';
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
import { RichTextEditorWrapper } from './styles';

const POSITION_TOP = 'top';
const POSITION_BOTTOM = 'bottom';
type toolbarLocationOption = 'bottom' | 'top';

export interface RichTextEditorProps extends RichTextEditorContentProps {
  /** Controlled value */
  content: string;
  /** Exposing editor onChange to outer component via props */
  onChange?: (editorHtml: string) => void;
  labels?: RichTextEditorLabels;
  toolbarLocation?: toolbarLocationOption;
  /** Toolbar controls config */
  toolbar?: string[];
  name?: string;
  isSubmitted?: boolean;
}
let editorContent: string;

export const RichTextEditor = (props: RichTextEditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    content,
    onChange,
    labels,
    toolbarLocation = POSITION_TOP,
    height,
    autoGrow,
    autoGrowMaxHeight,
    autoGrowMinHeight,
    name,
    isSubmitted
  } = props;
  const editorContentProps = {
    height,
    autoGrow,
    autoGrowMaxHeight,
    autoGrowMinHeight
  };
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

    if (name) {
      localStorage.setItem(name, content);
    }
  }, [editor, content]);

  useEffect(() => {
    if (!editor) return;

    if (name) {
      const storedContent = localStorage.getItem(name);
      editorContent = content || '';

      if (storedContent && storedContent !== content) {
        editor.commands.setContent(storedContent, false, {
          preserveWhitespace: true
        });

        if (onChange) {
          onChange(editor.getHTML());
        }
      }
    }
    return () => {
      if (name && (isSubmitted || content === editorContent)) {
        localStorage.removeItem(name);
      }
    };
  }, []);

  const editorParts = [
    <RichTextEditor.Toolbar>
      <RichTextEditor.ControlsGroup>
        <RichTextEditor.Bold />
        <RichTextEditor.Italic />
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
    </RichTextEditor.Toolbar>,
    <RichTextEditorContent {...editorContentProps} />
  ];

  const renderEditor = (toolbarLocation: toolbarLocationOption) => {
    if (toolbarLocation === POSITION_TOP) {
      return (
        <>
          {editorParts[0]}
          {editorParts[1]}
        </>
      );
    }
    return (
      <>
        {editorParts[1]}
        {editorParts[0]}
      </>
    );
  };

  return (
    <RichTextEditorProvider
      value={{
        editor,
        labels: mergedLabels
      }}
    >
      <RichTextEditorWrapper innerRef={ref}>
        {renderEditor(toolbarLocation)}
      </RichTextEditorWrapper>
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
RichTextEditor.H1 = controls.H1Control;
RichTextEditor.H2 = controls.H2Control;
RichTextEditor.H3 = controls.H3Control;
RichTextEditor.BulletList = controls.BulletListControl;
RichTextEditor.OrderedList = controls.OrderedListControl;
RichTextEditor.Link = RichTextEditorLinkControl;
RichTextEditor.Unlink = controls.UnlinkControl;
RichTextEditor.AlignLeft = controls.AlignLeftControl;
RichTextEditor.AlignRight = controls.AlignRightControl;
RichTextEditor.AlignCenter = controls.AlignCenterControl;
RichTextEditor.AlignJustify = controls.AlignJustifyControl;

RichTextEditor.FontSize = RichTextEditorFontControl;
