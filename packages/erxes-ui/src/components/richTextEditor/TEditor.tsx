import * as controls from './RichTextEditorControl/controls';

import { DEFAULT_LABELS, IRichTextEditorLabels } from './labels';
import { DropdownControlType, getToolbar } from './utils/getToolbarControl';
import {
  IRichTextEditorContentProps,
  RichTextEditorContent,
} from './RichTextEditorContent/RichTextEditorContent';
import {
  MoreButtonControl,
  RichTextEditorColorControl,
  RichTextEditorFontControl,
  RichTextEditorHighlightControl,
  RichTextEditorImageControl,
  RichTextEditorLinkControl,
  RichTextEditorPlaceholderControl,
  RichTextEditorSourceControl,
  TableControl,
} from './RichTextEditorControl';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { MentionSuggestionParams } from './utils/getMentionSuggestions';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { RichTextEditorControl } from './RichTextEditorControl/RichTextEditorControl';
import { RichTextEditorControlsGroup } from './RichTextEditorControlsGroup/RichTextEditorControlsGroup';
import { RichTextEditorProvider } from './RichTextEditor.context';
import { RichTextEditorToolbar } from './RichTextEditorToolbar/RichTextEditorToolbar';
import { RichTextEditorWrapper } from './styles';
import { Editor, useEditor } from '@tiptap/react';
import useExtensions from './hooks/useExtensions';

const POSITION_TOP = 'top';
const POSITION_BOTTOM = 'bottom';
type toolbarLocationOption = 'bottom' | 'top';
type ToolbarItem = string | DropdownControlType;

export type EditorMethods = {
  getIsFocused: () => boolean | undefined;
  getEditor: () => Editor | null;
  focus: (position?: 'start' | 'end' | 'all' | number | boolean | null) => void;
};

export interface IRichTextEditorProps extends IRichTextEditorContentProps {
  placeholder?: string;
  /** Controlled value */
  content?: string;
  /** Exposing editor onChange to outer component via props */
  onChange?: (editorHtml: string) => void;
  labels?: IRichTextEditorLabels;
  toolbarLocation?: toolbarLocationOption;
  autoFocus?: boolean;
  /** Toolbar controls config */
  toolbar?: ToolbarItem[];
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

const RichTextEditor = forwardRef(function RichTextEditor(
  props: IRichTextEditorProps,
  ref: React.ForwardedRef<EditorMethods>,
) {
  const {
    placeholder,
    content = '',
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
    toolbar,
    autoFocus,
  } = props;

  const editorContentProps = {
    height,
    autoGrow,
    autoGrowMaxHeight,
    autoGrowMinHeight,
  };

  const editorRef: React.MutableRefObject<Editor | null> = useRef(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);
  const [isSourceEnabled, setIsSourceEnabled] = useState(false);

  const extensions = useExtensions({
    placeholder: placeholder ?? '',
    showMentions,
    mentionSuggestion: showMentions ? mentionSuggestion : undefined,
    limit,
  });

  const editor = useEditor(
    {
      extensions,
      parseOptions: { preserveWhitespace: 'full' },
      autofocus: autoFocus,
    },
    [showMentions],
  );

  useEffect(() => {
    const handleEditorChange = ({ editor }) => {
      const editorContent = editor.getHTML();
      onChange && onChange(editorContent);

      if (name) {
        localStorage.setItem(name, editorContent);
      }
    };

    editor && editor.on('update', handleEditorChange);

    return () => {
      editor && editor.off('update', handleEditorChange);
    };
  }, [editor, onChange]);

  useEffect(() => {
    if (editor) {
      const { from, to } = editor.state.selection;
      editor
        .chain()
        .setContent(content, false, {
          preserveWhitespace: true,
        })
        .setTextSelection({ from, to })
        .run();

      onChange && onChange(content);
    }
  }, [editor, content]);

  useEffect(() => {
    if (editor && name) {
      const storedContent = localStorage.getItem(name);
      if (!storedContent) {
        return;
      }
      editor.commands.setContent(storedContent, false, {
        preserveWhitespace: true,
      });

      onChange && onChange(storedContent);
    }
  }, [editor, name]);

  useEffect(() => {
    if (name && isSubmitted) {
      localStorage.removeItem(name);
    }
  }, [name, isSubmitted]);

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => editorRef.current,
      getIsFocused: () => editorRef.current?.isFocused,
      focus: (position) => editorRef.current?.commands.focus(position),
    }),
    [],
  );

  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );

  const editorParts = useMemo(
    () => [
      <RichTextEditorComponent.Toolbar key="rich-text-editor-toolbar-key">
        {placeholderProp && (
          <RichTextEditorComponent.Placeholder
            placeholderProp={placeholderProp}
            toolbarPlacement={toolbarLocation}
          />
        )}
        {toolbar ? (
          getToolbar({ toolbar, toolbarLocation })
        ) : (
          <>
            <RichTextEditorComponent.FontSize
              toolbarPlacement={toolbarLocation}
            />

            {integrationKind !== 'telnyx' && (
              <RichTextEditorComponent.ControlsGroup
                isDropdown={true}
                controlNames={['heading']}
                toolbarPlacement={toolbarLocation}
              >
                <RichTextEditorComponent.H1 />
                <RichTextEditorComponent.H2 />
                <RichTextEditorComponent.H3 />
              </RichTextEditorComponent.ControlsGroup>
            )}

            <RichTextEditorComponent.ControlsGroup>
              <RichTextEditorComponent.ColorControl />
              <RichTextEditorComponent.HighlightControl />
            </RichTextEditorComponent.ControlsGroup>

            {integrationKind !== 'telnyx' && (
              <RichTextEditorComponent.ControlsGroup>
                <RichTextEditorComponent.Bold />
                <RichTextEditorComponent.Italic />
                <RichTextEditorComponent.Underline />
                <RichTextEditorComponent.Strikethrough />
              </RichTextEditorComponent.ControlsGroup>
            )}

            <RichTextEditorComponent.ControlsGroup
              isDropdown={true}
              controlNames={[
                { textAlign: 'left' },
                { textAlign: 'center' },
                { textAlign: 'right' },
                { textAlign: 'justify' },
              ]}
              toolbarPlacement={toolbarLocation}
            >
              <RichTextEditorComponent.AlignLeft />
              <RichTextEditorComponent.AlignRight />
              <RichTextEditorComponent.AlignCenter />
              <RichTextEditorComponent.AlignJustify />
            </RichTextEditorComponent.ControlsGroup>

            {integrationKind !== 'telnyx' && (
              <RichTextEditorComponent.ControlsGroup
                isDropdown={true}
                controlNames={['orderedList', 'bulletList']}
                toolbarPlacement={toolbarLocation}
              >
                <RichTextEditorComponent.BulletList />
                <RichTextEditorComponent.OrderedList />
              </RichTextEditorComponent.ControlsGroup>
            )}

            <RichTextEditorComponent.ControlsGroup>
              <RichTextEditorComponent.SourceControl />
              <RichTextEditorComponent.MoreControl
                toolbarPlacement={toolbarLocation}
              >
                {integrationKind !== 'telnyx' && (
                  <>
                    <RichTextEditorComponent.Blockquote />
                    <RichTextEditorComponent.HorizontalRule />
                    <RichTextEditorComponent.Link />
                    <RichTextEditorComponent.Unlink />
                  </>
                )}
                <RichTextEditorComponent.ImageControl />
                <RichTextEditorComponent.TableControl />
              </RichTextEditorComponent.MoreControl>
            </RichTextEditorComponent.ControlsGroup>
          </>
        )}
      </RichTextEditorComponent.Toolbar>,

      <RichTextEditorContent
        {...editorContentProps}
        key="erxes-rte-content-key"
      />,
    ],
    [],
  );

  const renderEditor = useCallback(() => {
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
  }, []);

  const toggleSourceView = () => {
    setIsSourceEnabled(!isSourceEnabled);
  };

  if (!editor) return null;
  editorRef.current = editor;
  return (
    <RichTextEditorProvider
      value={{
        editor,
        labels: mergedLabels,
        isSourceEnabled,
        toggleSourceView,
        codeMirrorRef,
      }}
    >
      <RichTextEditorWrapper innerRef={wrapperRef} $position={toolbarLocation}>
        {renderEditor()}
      </RichTextEditorWrapper>
    </RichTextEditorProvider>
  );
});

interface RichTextEditorType
  extends React.ForwardRefExoticComponent<
    IRichTextEditorProps & React.RefAttributes<EditorMethods>
  > {
  Content: typeof RichTextEditorContent;
  Control: typeof RichTextEditorControl;
  Toolbar: typeof RichTextEditorToolbar;
  ControlsGroup: typeof RichTextEditorControlsGroup;
  Bold: typeof controls.BoldControl;
  Italic: typeof controls.ItalicControl;
  Underline: typeof controls.UnderlineControl;
  Strikethrough: typeof controls.StrikeThroughControl;
  H1: typeof controls.H1Control;
  H2: typeof controls.H2Control;
  H3: typeof controls.H3Control;
  BulletList: typeof controls.BulletListControl;
  OrderedList: typeof controls.OrderedListControl;
  Blockquote: typeof controls.BlockquoteControl;
  Link: typeof RichTextEditorLinkControl;
  Unlink: typeof controls.UnlinkControl;
  HorizontalRule: typeof controls.HorizontalRuleControl;
  AlignLeft: typeof controls.AlignLeftControl;
  AlignRight: typeof controls.AlignRightControl;
  AlignCenter: typeof controls.AlignCenterControl;
  AlignJustify: typeof controls.AlignJustifyControl;
  FontSize: typeof RichTextEditorFontControl;
  ImageControl: typeof RichTextEditorImageControl;
  ColorControl: typeof RichTextEditorColorControl;
  HighlightControl: typeof RichTextEditorHighlightControl;
  SourceControl: typeof RichTextEditorSourceControl;
  Placeholder: typeof RichTextEditorPlaceholderControl;
  TableControl: typeof TableControl;
  MoreControl: typeof MoreButtonControl;
}

const RichTextEditorComponent = RichTextEditor as RichTextEditorType;

// Generic components
RichTextEditorComponent.Content = RichTextEditorContent;
RichTextEditorComponent.Control = RichTextEditorControl;
RichTextEditorComponent.Toolbar = RichTextEditorToolbar;
RichTextEditorComponent.ControlsGroup = RichTextEditorControlsGroup;

// Controls components
RichTextEditorComponent.Bold = controls.BoldControl;
RichTextEditorComponent.Italic = controls.ItalicControl;
RichTextEditorComponent.Underline = controls.UnderlineControl;
RichTextEditorComponent.Strikethrough = controls.StrikeThroughControl;
RichTextEditorComponent.H1 = controls.H1Control;
RichTextEditorComponent.H2 = controls.H2Control;
RichTextEditorComponent.H3 = controls.H3Control;
RichTextEditorComponent.BulletList = controls.BulletListControl;
RichTextEditorComponent.OrderedList = controls.OrderedListControl;
RichTextEditorComponent.Blockquote = controls.BlockquoteControl;
RichTextEditorComponent.Link = RichTextEditorLinkControl;
RichTextEditorComponent.Unlink = controls.UnlinkControl;
RichTextEditorComponent.HorizontalRule = controls.HorizontalRuleControl;
RichTextEditorComponent.AlignLeft = controls.AlignLeftControl;
RichTextEditorComponent.AlignRight = controls.AlignRightControl;
RichTextEditorComponent.AlignCenter = controls.AlignCenterControl;
RichTextEditorComponent.AlignJustify = controls.AlignJustifyControl;

RichTextEditorComponent.FontSize = RichTextEditorFontControl;

RichTextEditorComponent.ImageControl = RichTextEditorImageControl;

RichTextEditorComponent.ColorControl = RichTextEditorColorControl;
RichTextEditorComponent.HighlightControl = RichTextEditorHighlightControl;

RichTextEditorComponent.SourceControl = RichTextEditorSourceControl;
RichTextEditorComponent.Placeholder = RichTextEditorPlaceholderControl;
RichTextEditorComponent.TableControl = TableControl;

RichTextEditorComponent.MoreControl = MoreButtonControl;

export { RichTextEditorComponent as RichTextEditor, RichTextEditorType };
