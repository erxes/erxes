import * as controls from './RichTextEditorControl/controls';

import { DEFAULT_LABELS, IRichTextEditorLabels } from './labels';
import {
  IRichTextEditorContentProps,
  RichTextEditorContent,
} from './RichTextEditorContent/RichTextEditorContent';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  RichTextEditorColorControl,
  RichTextEditorFontControl,
  RichTextEditorHighlightControl,
  RichTextEditorImageControl,
  RichTextEditorLinkControl,
  RichTextEditorPlaceholderControl,
  RichTextEditorSourceControl,
  TableControl,
  MoreButtonControl,
} from './RichTextEditorControl';

import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { RichTextEditorControl } from './RichTextEditorControl/RichTextEditorControl';
import { RichTextEditorControlsGroup } from './RichTextEditorControlsGroup/RichTextEditorControlsGroup';
import { RichTextEditorProvider } from './RichTextEditor.context';
import { RichTextEditorToolbar } from './RichTextEditorToolbar/RichTextEditorToolbar';
import { RichTextEditorWrapper } from './styles';
import { useEditor } from '@tiptap/react';
import useExtensions from './hooks/useExtensions';
import { MentionSuggestionParams } from './utils/getMentionSuggestions';

const POSITION_TOP = 'top';
const POSITION_BOTTOM = 'bottom';
type toolbarLocationOption = 'bottom' | 'top';

export interface IRichTextEditorProps extends IRichTextEditorContentProps {
  placeholder?: string;
  /** Controlled value */
  content: string;
  /** Exposing editor onChange to outer component via props */
  onChange?: (editorHtml: string) => void;
  labels?: IRichTextEditorLabels;
  toolbarLocation?: toolbarLocationOption;
  /** Toolbar controls config */
  toolbar?: string[];
  name?: string;
  isSubmitted?: boolean;
  /** Mention suggestion string list */
  mentionSuggestion?: MentionSuggestionParams;
  /** Mention suggestion string list */
  placeholderProp?: any;
  showMentions?: boolean;
  /** Character count limit. */
  limit?: number;
  contentType?: string;
  integrationKind?: string;
}
let editorContent: string;

export const RichTextEditor = (props: IRichTextEditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);
  const [isSourceEnabled, setIsSourceEnabled] = useState(false);
  const {
    placeholder,
    content,
    onChange,
    labels,
    toolbarLocation = POSITION_TOP,
    height,
    autoGrow,
    autoGrowMaxHeight,
    autoGrowMinHeight,
    name,
    isSubmitted,
    showMentions = false,
    mentionSuggestion,
    placeholderProp,
    integrationKind,
    limit,
  } = props;

  const editorContentProps = {
    height,
    autoGrow,
    autoGrowMaxHeight,
    autoGrowMinHeight,
  };

  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );

  const handleEditorChange = ({ editor: editorInstance }) => {
    if (onChange) {
      onChange(editorInstance.getHTML());
    }
  };

  const toggleSource = () => {
    setIsSourceEnabled(!isSourceEnabled);
  };

  const extensions = useExtensions({
    placeholder: placeholder ?? '',
    showMentions,
    mentionSuggestion: showMentions ? mentionSuggestion : undefined,
  });

  const editor = useEditor(
    {
      extensions,
      content,
      parseOptions: { preserveWhitespace: 'full' },
      onUpdate: handleEditorChange,
    },
    [showMentions],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    const { from, to } = editor.state.selection;
    editor.commands.setContent(content, false, {
      preserveWhitespace: true,
    });

    editor.commands.setTextSelection({ from, to });

    if (name) {
      localStorage.setItem(name, content);
    }
  }, [editor, content]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (name) {
      const storedContent = localStorage.getItem(name);
      editorContent = content || '';

      if (storedContent && storedContent !== content) {
        editor.commands.setContent(storedContent, false, {
          preserveWhitespace: true,
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

  const editorParts = useMemo(
    () => [
      <RichTextEditor.Toolbar key="rich-text-editor-toolbar-key">
        {placeholderProp && (
          <RichTextEditor.Placeholder
            placeholderProp={placeholderProp}
            toolbarPlacement={toolbarLocation}
          />
        )}
        <RichTextEditor.FontSize toolbarPlacement={toolbarLocation} />

        {integrationKind !== 'telnyx' && (
          <RichTextEditor.ControlsGroup
            isDropdown={true}
            controlNames={['heading']}
            toolbarPlacement={toolbarLocation}
          >
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
          </RichTextEditor.ControlsGroup>
        )}

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.ColorControl />
          <RichTextEditor.HighlightControl />
        </RichTextEditor.ControlsGroup>

        {integrationKind !== 'telnyx' && (
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
          </RichTextEditor.ControlsGroup>
        )}

        <RichTextEditor.ControlsGroup
          isDropdown={true}
          controlNames={[
            { textAlign: 'left' },
            { textAlign: 'center' },
            { textAlign: 'right' },
            { textAlign: 'justify' },
          ]}
          toolbarPlacement={toolbarLocation}
        >
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignRight />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
        </RichTextEditor.ControlsGroup>

        {integrationKind !== 'telnyx' && (
          <RichTextEditor.ControlsGroup
            isDropdown={true}
            controlNames={['orderedList', 'bulletList']}
            toolbarPlacement={toolbarLocation}
          >
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>
        )}

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.SourceControl />
          <RichTextEditor.MoreControl toolbarPlacement={toolbarLocation}>
            {integrationKind !== 'telnyx' && (
              <>
                <RichTextEditor.Blockquote />
                <RichTextEditor.HorizontalRule />
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </>
            )}
            <RichTextEditor.ImageControl />
            <RichTextEditor.TableControl />
          </RichTextEditor.MoreControl>
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>,

      <RichTextEditorContent
        {...editorContentProps}
        key="erxes-rte-content-key"
      />,
    ],
    [],
  );

  const renderEditor = () => {
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
        labels: mergedLabels,
        isSourceEnabled,
        toggleSource,
        codeMirrorRef,
      }}
    >
      <RichTextEditorWrapper innerRef={ref} $position={toolbarLocation}>
        {renderEditor()}
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
RichTextEditor.Underline = controls.UnderlineControl;
RichTextEditor.Strikethrough = controls.StrikeThroughControl;
RichTextEditor.H1 = controls.H1Control;
RichTextEditor.H2 = controls.H2Control;
RichTextEditor.H3 = controls.H3Control;
RichTextEditor.BulletList = controls.BulletListControl;
RichTextEditor.OrderedList = controls.OrderedListControl;
RichTextEditor.Blockquote = controls.BlockquoteControl;
RichTextEditor.Link = RichTextEditorLinkControl;
RichTextEditor.Unlink = controls.UnlinkControl;
RichTextEditor.HorizontalRule = controls.HorizontalRuleControl;
RichTextEditor.AlignLeft = controls.AlignLeftControl;
RichTextEditor.AlignRight = controls.AlignRightControl;
RichTextEditor.AlignCenter = controls.AlignCenterControl;
RichTextEditor.AlignJustify = controls.AlignJustifyControl;

RichTextEditor.FontSize = RichTextEditorFontControl;

RichTextEditor.ImageControl = RichTextEditorImageControl;

RichTextEditor.ColorControl = RichTextEditorColorControl;
RichTextEditor.HighlightControl = RichTextEditorHighlightControl;

RichTextEditor.SourceControl = RichTextEditorSourceControl;
RichTextEditor.Placeholder = RichTextEditorPlaceholderControl;
RichTextEditor.TableControl = TableControl;

RichTextEditor.MoreControl = MoreButtonControl;
