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

StyleButton.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.object,
  style: PropTypes.string,
  title: PropTypes.string,
  onToggle: PropTypes.func,
};

const BLOCK_TYPES = [
  { label: <b>H</b>, style: 'header-three', title: 'Heading' },
  { label: <i className="ion-quote" />, style: 'blockquote', title: 'Blockquote' },
  { label: <i className="ion-ios-circle-filled" />, style: 'unordered-list-item', title: 'Unordered list' },
  { label: <i className="ion-pound" />, style: 'ordered-list-item', title: 'Ordered list' },
  { label: <i className="ion-code" />, style: 'code-block', title: 'Code Block' },
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
          key={type.title}
          active={type.style === blockType}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
          title={type.title}
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
  { label: <b>B</b>, style: 'BOLD', title: 'Bold' },
  { label: <i>I</i>, style: 'ITALIC', title: 'Italic' },
  { label: <u>U</u>, style: 'UNDERLINE', title: 'Underline' },
];

const InlineStyleControls = ({ onToggle, editorState }) => {
  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.title}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
          title={type.title}
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
        <div className="RichEditor-controls-root">
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />

          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
        </div>

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
