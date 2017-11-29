import React, { Component } from 'react';
import PropTypes from 'prop-types';
import createMentionPlugin, {
  defaultSuggestionsFilter
} from 'bat-draft-js-mention-plugin';
import { EditorState, ContentState, getDefaultKeyBinding } from 'draft-js';
import _ from 'underscore';
import {
  ErxesEditor,
  toHTML,
  createStateFromHTML
} from 'modules/common/components/Editor';

const MentionEntry = props => {
  const { mention, theme, searchValue, ...parentProps } = props; // eslint-disable-line

  return (
    <div {...parentProps}>
      <div className="mentionSuggestionsEntryContainer">
        <div className="mentionSuggestionsEntryContainerLeft">
          <img
            alt={mention.get('name')}
            role="presentation"
            src={mention.get('avatar')}
            className="mentionSuggestionsEntryAvatar"
          />
        </div>

        <div className="mentionSuggestionsEntryContainerRight">
          <div className="mentionSuggestionsEntryText">
            {mention.get('name')}
          </div>

          <div className="mentionSuggestionsEntryTitle">
            {mention.get('title')}
          </div>
        </div>
      </div>
    </div>
  );
};

const extractEntries = mention => {
  const entries = mention._root.entries;
  const keys = _.map(entries, entry => entry[0]);
  const values = _.map(entries, entry => entry[1]);

  return _.object(keys, values);
};

const mentionPlugin = createMentionPlugin({
  mentionPrefix: '@'
});

const { MentionSuggestions } = mentionPlugin;
const plugins = [mentionPlugin];

export default class Editor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
      collectedMentions: [],
      suggestions: this.props.mentions.toArray()
    };

    this.onChange = this.onChange.bind(this);
    this.keyBindingFn = this.keyBindingFn.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onAddMention = this.onAddMention.bind(this);
    this.getContent = this.getContent.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.responseTemplate !== this.props.responseTemplate) {
      const editorState = createStateFromHTML(
        this.state.editorState,
        nextProps.responseTemplate
      );

      // calling onChange, because draftjs's onChange is not trigerring after
      // this setState
      this.props.onChange(this.getContent(editorState));

      // set editor state from response template
      this.setState({ editorState });
    }
  }

  onChange(editorState) {
    this.setState({ editorState });

    this.props.onChange(this.getContent(editorState));
  }

  onSearchChange({ value }) {
    this.setState({
      suggestions: defaultSuggestionsFilter(
        value,
        this.props.mentions.toArray()
      )
    });
  }

  onAddMention(object) {
    const mention = extractEntries(object);

    const collectedMentions = this.state.collectedMentions;

    collectedMentions.push(mention);

    this.setState({ collectedMentions });
  }

  getContent(editorState) {
    let content = toHTML(editorState);

    // some mentioned people may have been deleted
    const finalMentions = [];

    // replace mention content
    _.each(this.state.collectedMentions, m => {
      const toFind = `@${m.name}`;
      const re = new RegExp(toFind, 'g');

      // collect only not removed mentions
      const findResult = content.match(re);

      if (findResult && findResult.length > 0) {
        finalMentions.push(m);
      }

      content = content.replace(
        re,
        `<MentionedPerson data-user-id='${m._id}'>@${m.name}</MentionedPerson>`
      );
    });

    // send mentioned user to parent
    this.props.onAddMention(_.pluck(finalMentions, '_id'));

    return content;
  }

  keyBindingFn(e) {
    if (e.key === 'Enter' && e.shiftKey) {
      return getDefaultKeyBinding(e);
    }

    // handle shift + enter in editor
    if (e.key === 'Enter') {
      // call parent's method to save content
      this.props.onShifEnter();

      // clear content
      const state = this.state.editorState;
      const editorState = EditorState.push(
        state,
        ContentState.createFromText('')
      );
      this.setState({ editorState });

      return null;
    }

    return getDefaultKeyBinding(e);
  }

  render() {
    const pluginContent = (
      <MentionSuggestions
        onSearchChange={this.onSearchChange}
        suggestions={this.props.showMentions ? this.state.suggestions : []}
        entryComponent={MentionEntry}
        onAddMention={this.onAddMention}
        onChange={this.onChange}
      />
    );

    const props = {
      ...this.props,
      editorState: this.state.editorState,
      onChange: this.onChange,
      keyBindingFn: this.keyBindingFn,
      plugins,
      pluginContent
    };

    return <ErxesEditor {...props} />;
  }
}

Editor.propTypes = {
  onChange: PropTypes.func,
  onAddMention: PropTypes.func,
  onShifEnter: PropTypes.func,
  showMentions: PropTypes.bool,
  responseTemplate: PropTypes.string,
  mentions: PropTypes.object // eslint-disable-line
};
