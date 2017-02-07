/* eslint-disable no-underscore-dangle, react/no-string-refs,
  jsx-a11y/no-static-element-interactions, react/no-multi-comp,
  react/forbid-prop-types */

import React, { PropTypes } from 'react';
import Draft, { Editor, EditorState, ContentState, RichUtils } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

class StyleButton extends React.Component {
  constructor(props) {
    super(props);

    const { style, onToggle } = props;

    this.onToggle = (e) => {
      e.preventDefault();
      onToggle(style);
    };
  }

  render() {
    const { active, label } = this.props;

    let className = 'RichEditor-styleButton';

    if (active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {label}
      </span>
    );
  }
}

StyleButton.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.string,
  style: PropTypes.string,
  onToggle: PropTypes.func,
};

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Code Block', style: 'code-block' },
];

const BlockStyleControls = (props) => {
  const { editorState, onToggle } = props;

  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map(type =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />,
      )}
    </div>
  );
};

BlockStyleControls.propTypes = {
  onToggle: PropTypes.func,
  editorState: PropTypes.object,
};

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Monospace', style: 'CODE' },
];

const InlineStyleControls = ({ onToggle, editorState }) => {
  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />,
      )}
    </div>
  );
};

InlineStyleControls.propTypes = {
  onToggle: PropTypes.func,
  editorState: PropTypes.object,
};

export class ErxesEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = { editorState: props.state };

    this.focus = () => this.refs.editor.focus();

    this.onChange = this.onChange.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.onTab = this.onTab.bind(this);
    this.toggleBlockType = this.toggleBlockType.bind(this);
    this.toggleInlineStyle = this.toggleInlineStyle.bind(this);
  }

  onTab(e) {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  onChange(editorState) {
    this.setState({ editorState });

    this.props.onChange(editorState);
  }

  handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);

      return true;
    }

    return false;
  }

  toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType,
      ),
    );
  }

  toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle,
      ),
    );
  }

  render() {
    const { editorState } = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    const contentState = editorState.getCurrentContent();

    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div className="RichEditor-root">
        <BlockStyleControls
          editorState={editorState}
          onToggle={this.toggleBlockType}
        />

        <InlineStyleControls
          editorState={editorState}
          onToggle={this.toggleInlineStyle}
        />

        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            onTab={this.onTab}
            placeholder={this.props.placeholder}
            keyBindingFn={this.props.keyBindingFn}
            ref="editor"
            spellCheck
          />
        </div>
      </div>
    );
  }
}

ErxesEditor.propTypes = {
  state: PropTypes.object,
  onChange: PropTypes.func,
  keyBindingFn: PropTypes.func,
  placeholder: PropTypes.string,
};

export const createEmptyState = () => EditorState.createEmpty();
export const toHTML = state => stateToHTML(state.getCurrentContent());
export const getDefaultKeyBinding = e => Draft.getDefaultKeyBinding(e);

export const createStateFromHTML = (html) => {
  const blocksFromHTML = Draft.convertFromHTML(html);
  const content = ContentState.createFromBlockArray(blocksFromHTML);
  const editorState = EditorState.createWithContent(content);

  return editorState;
};
