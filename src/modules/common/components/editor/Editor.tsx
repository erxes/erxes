import Draft, { ContentState, EditorState, RichUtils } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import Editor from 'draft-js-plugins-editor';
import React, { Component } from 'react';
import {
  RichEditorControls,
  RichEditorControlsRoot,
  RichEditorRoot
} from './styles';

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    default:
      return null;
  }
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

type Props = {
  active: boolean,
  label?: any,
  style?: string,
  title?: string,
  onToggle: (style: string) => void
};

class StyleButton extends Component<Props> {
  onToggle: any;
  constructor(props: Props) {
    super(props);

    const { style, onToggle } = props;

    this.onToggle = e => {
      e.preventDefault();
      onToggle(style);
    };
  }

  render() {
    const { active, label, title } = this.props;

    let className = 'RichEditor-styleButton';

    if (active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} title={title} onMouseDown={this.onToggle}>
        {label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  {
    label: <i className="icon-fontsize" />,
    style: 'header-three',
    title: 'Heading'
  },
  {
    label: <i className="icon-rightquote" />,
    style: 'blockquote',
    title: 'Blockquote'
  },
  {
    label: <i className="icon-list-2" />,
    style: 'unordered-list-item',
    title: 'Unordered list'
  },
  {
    label: <i className="icon-list" />,
    style: 'ordered-list-item',
    title: 'Ordered list'
  },
  {
    label: <i className="icon-superscript" />,
    style: 'code-block',
    title: 'Code Block'
  }
];

type BlockStyleProps = {
  onToggle: (blockType: any) => void,
  editorState: any
};

const BlockStyleControls = (props: BlockStyleProps) => {
  const { editorState, onToggle } = props;

  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <RichEditorControls>
      {BLOCK_TYPES.map(type => (
        <StyleButton
          key={type.title}
          active={type.style === blockType}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
          title={type.title}
        />
      ))}
    </RichEditorControls>
  );
};

const INLINE_STYLES = [
  { label: <i className="icon-bold" />, style: 'BOLD', title: 'Bold' },
  { label: <i className="icon-italic" />, style: 'ITALIC', title: 'Italic' },
  {
    label: <i className="icon-underline" />,
    style: 'UNDERLINE',
    title: 'Underline'
  }
];

type InlineStyleProps = {
  onToggle: (inlineStyle: any) => void,
  editorState: any
}

const InlineStyleControls = ({ onToggle, editorState }: InlineStyleProps) => {
  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <RichEditorControls>
      {INLINE_STYLES.map(type => (
        <StyleButton
          key={type.title}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
          title={type.title}
        />
      ))}
    </RichEditorControls>
  );
};

type ErxesEditorProps = {
  editorState: any,
  onChange: (richUtils: any) => void,
  bordered: boolean,
  // extra control rows
  controls?: any[],
  pluginContent?: any,
  plugins?: any[]
  keyBindingFn?: () => void,
  onUpArrow?: () => void,
  onDownArrow?: () => void,
  handleFileInput?: (e: any) => void,
  placeholder?: string
};

export class ErxesEditor extends Component<ErxesEditorProps> {
  constructor(props: ErxesEditorProps) {
    super(props);

    // TODO: remove any
    const editor: any = this.refs.editor;
    this.focus = () => editor.focus();

    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.onTab = this.onTab.bind(this);
    this.handlePastedFile = this.handlePastedFile.bind(this);
    this.toggleBlockType = this.toggleBlockType.bind(this);
    this.toggleInlineStyle = this.toggleInlineStyle.bind(this);
  }

  focus() {}

  onTab(e) {
    const { onChange, editorState } = this.props;
    const maxDepth = 4;

    onChange(RichUtils.onTab(e, editorState, maxDepth));
  }

  handleKeyCommand(command) {
    const { onChange, editorState } = this.props;
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      onChange(newState);

      return true;
    }

    return false;
  }

  toggleBlockType(blockType) {
    const { onChange, editorState } = this.props;

    onChange(RichUtils.toggleBlockType(editorState, blockType));
  }

  toggleInlineStyle(inlineStyle) {
    const { onChange, editorState } = this.props;

    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  }

  handlePastedFile(e) {
    if (this.props.handleFileInput) {
      this.props.handleFileInput(e);
    }
  }

  render() {
    const {
      editorState,
      controls,
      onUpArrow,
      onDownArrow,
      bordered
    } = this.props;

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
      <RichEditorRoot bordered={bordered}>
        <RichEditorControlsRoot>
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />

          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />

          {controls ? controls : null}
        </RichEditorControlsRoot>

        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onTab={this.onTab}
            onChange={this.props.onChange}
            placeholder={this.props.placeholder}
            keyBindingFn={this.props.keyBindingFn}
            onUpArrow={onUpArrow}
            onDownArrow={onDownArrow}
            // tslint:disable-next-line:jsx-no-string-ref
            ref="editor"
            plugins={this.props.plugins}
            spellCheck
            handlePastedFiles={this.handlePastedFile}
          />
        </div>
        {this.props.pluginContent}
      </RichEditorRoot>
    );
  }
}

export const toHTML = state => stateToHTML(state.getCurrentContent());

export const createStateFromHTML = (editorState, html) => {
  const { contentBlocks, entityMap }  = Draft.convertFromHTML(html);
  const content = ContentState.createFromBlockArray(contentBlocks, entityMap);

  // TODO: Check insert-fragment
  return EditorState.push(editorState, content, 'insert-fragment');
};

// TODO: Check insert-fragment
export const clearContent = editorState =>
  EditorState.push(editorState, ContentState.createFromText(''), 'insert-fragment');

export default {
  ErxesEditor,
  toHTML,
  createStateFromHTML,
  clearContent
};
