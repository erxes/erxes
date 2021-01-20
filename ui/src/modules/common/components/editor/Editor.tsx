import Draft from 'draft-js';
import { ContentState, EditorState, RichUtils } from 'draft-js';
import createLinkPlugin from 'draft-js-anchor-plugin';
import 'draft-js-anchor-plugin/lib/plugin.css';
import {
  BlockquoteButton,
  BoldButton,
  CodeBlockButton,
  ItalicButton,
  OrderedListButton,
  UnderlineButton,
  UnorderedListButton
} from 'draft-js-buttons';
import createEmojiPlugin from 'draft-js-emoji-plugin';
import 'draft-js-emoji-plugin/lib/plugin.css';
import { stateToHTML } from 'draft-js-export-html';
import Editor from 'draft-js-plugins-editor';
import createToolbarPlugin, { Separator } from 'draft-js-static-toolbar-plugin';
import 'draft-js-static-toolbar-plugin/lib/plugin.css';
import { getDraftDecorator } from 'modules/common/components/editor/DraftjsHelpers';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import HeadlinesButton from './HeadlinesButton';
import { RichEditorControlsRoot, RichEditorRoot } from './styles';

type ErxesEditorProps = {
  editorState: EditorState;
  onChange: (richUtils: RichUtils) => void;
  bordered?: boolean;
  isTopPopup?: boolean;
  // extra control rows
  controls?: any[];
  pluginContent?: any;
  plugins?: any[];
  keyBindingFn?: (e: any) => any;
  onUpArrow?: (e: KeyboardEvent) => void;
  onDownArrow?: (e: KeyboardEvent) => void;
  onEscape?: (e: KeyboardEvent) => void;
  handleFileInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  placeholder?: string | React.ReactNode;
};

export class ErxesEditor extends React.Component<ErxesEditorProps> {
  editor: Editor = this.refs.editor;
  private linkPlugin;
  private toolbarPlugin;
  private emojiPlugin;

  constructor(props) {
    super(props);

    const options = settings => {
      if (props.isTopPopup) {
        return {
          top: settings.decoratorRect.y - 30 + 'px', // change this value (30) for manage the distance between cursor and bottom edge of popover
          transform: 'scale(1) translateY(-100%)'
        };
      }

      return {
        top: settings.decoratorRect.y + 'px',
        transform: 'scale(1)'
      };
    };

    this.linkPlugin = createLinkPlugin();
    this.toolbarPlugin = createToolbarPlugin();
    this.emojiPlugin = createEmojiPlugin({
      useNativeArt: true,
      selectButtonContent: <Icon icon="smile" />,
      positionSuggestions: settings => {
        return {
          left: settings.decoratorRect.x + 'px',
          boxShadow: '0 0 12px 0 rgba(0, 0, 0, 0.1)',
          transformOrigin: '1em 0%',
          position: 'fixed',
          transition: 'all 0.2s cubic-bezier(0.3, 1.2, 0.2, 1) 0s',
          ...options(settings)
        };
      }
    });
  }

  focus = () => {
    this.editor.focus();
  };

  onTab = e => {
    const { onChange, editorState } = this.props;
    const maxDepth = 4;

    onChange(RichUtils.onTab(e, editorState, maxDepth));
  };

  handleKeyCommand = (command: string) => {
    const { onChange, editorState } = this.props;
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      onChange(newState);

      return true;
    }

    return false;
  };

  toggleBlockType = (blockType: string = 'unstyled') => {
    const { onChange, editorState } = this.props;

    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  toggleInlineStyle = inlineStyle => {
    const { onChange, editorState } = this.props;

    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  handlePastedFile = e => {
    if (this.props.handleFileInput) {
      this.props.handleFileInput(e);
    }
  };

  render() {
    const {
      editorState,
      controls,
      onUpArrow,
      onDownArrow,
      onEscape,
      bordered,
      isTopPopup = false,
      plugins
    } = this.props;

    const updatedPlugins = [
      this.toolbarPlugin,
      this.linkPlugin,
      this.emojiPlugin
    ].concat(plugins || []);

    // plugins
    const { Toolbar } = this.toolbarPlugin;
    const { LinkButton } = this.linkPlugin;
    const { EmojiSuggestions, EmojiSelect } = this.emojiPlugin;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    const contentState = editorState.getCurrentContent();

    if (!contentState.hasText()) {
      if (
        contentState
          .getBlockMap()
          .first()
          .getType() !== 'unstyled'
      ) {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <RichEditorRoot bordered={bordered || false}>
        <div className={className} onClick={this.focus}>
          <Editor
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onTab={this.onTab}
            onChange={this.props.onChange}
            placeholder={this.props.placeholder}
            keyBindingFn={this.props.keyBindingFn}
            onUpArrow={onUpArrow}
            onDownArrow={onDownArrow}
            onEscape={onEscape}
            ref={element => {
              this.editor = element;
            }}
            plugins={updatedPlugins}
            spellCheck={true}
            handlePastedFiles={this.handlePastedFile}
          />
          <EmojiSuggestions />
        </div>
        <RichEditorControlsRoot isTopPopup={isTopPopup}>
          <Toolbar>
            {externalProps => (
              <>
                <BoldButton {...externalProps} />
                <ItalicButton {...externalProps} />
                <UnderlineButton {...externalProps} />
                <Separator {...externalProps} />
                <HeadlinesButton {...externalProps} />
                <UnorderedListButton {...externalProps} />
                <OrderedListButton {...externalProps} />
                <BlockquoteButton {...externalProps} />
                <CodeBlockButton {...externalProps} />
                <LinkButton {...externalProps} />
                <EmojiSelect />
                {controls ? controls : null}
              </>
            )}
          </Toolbar>
        </RichEditorControlsRoot>
        {this.props.pluginContent}
      </RichEditorRoot>
    );
  }
}

export const toHTML = (state: EditorState) =>
  stateToHTML(state.getCurrentContent());

export const createStateFromHTML = (
  editorState: EditorState,
  html: string
): EditorState => {
  if (!html) {
    return editorState;
  }

  const { contentBlocks, entityMap } = Draft.convertFromHTML(html);

  if (!contentBlocks) {
    return editorState;
  }

  const content = ContentState.createFromBlockArray(contentBlocks, entityMap);

  return EditorState.createWithContent(content, getDraftDecorator());
};

// TODO: Check insert-fragment
export const clearContent = editorState =>
  EditorState.push(
    editorState,
    ContentState.createFromText(''),
    'insert-fragment'
  );

export default {
  ErxesEditor,
  toHTML,
  createStateFromHTML,
  clearContent
};
