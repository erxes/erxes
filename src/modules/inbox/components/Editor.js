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
            src={mention.get('avatar') || '/images/avatar-colored.png'}
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

// response templates
class TemplateList extends React.Component {
  normalizeIndex(selectedIndex, max) {
    let index = selectedIndex % max;

    if (index < 0) {
      index += max;
    }

    return index;
  }

  render() {
    const { suggestionsState } = this.props;

    const { selectedIndex, templates } = suggestionsState;

    if (!templates) {
      return null;
    }

    const style = {
      position: 'absolute',
      left: 0,
      top: 70,
      paddingLeft: 15,
      listStyleType: 'none'
    };

    const normalizedIndex = this.normalizeIndex(
      selectedIndex,
      templates.length
    );

    return (
      <ul style={style} className="response-template-suggestions">
        {templates.map((template, index) => {
          const liStyle = {
            backgroundColor: '#dcd9d9',
            padding: '0px 5px',
            margin: '0px 5px'
          };

          if (normalizedIndex === index) {
            liStyle.fontWeight = 'bold';
          }

          return (
            <li key={template._id} style={liStyle}>
              {template.name}
            </li>
          );
        }, this)}
      </ul>
    );
  }
}

TemplateList.propTypes = {
  suggestionsState: PropTypes.object
};

export default class Editor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
      collectedMentions: [],
      suggestions: this.props.mentions.toArray(),
      templatesState: null
    };

    this.onChange = this.onChange.bind(this);
    this.keyBindingFn = this.keyBindingFn.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onAddMention = this.onAddMention.bind(this);
    this.getContent = this.getContent.bind(this);

    this.getTemplatesState = this.getTemplatesState.bind(this);
    this.onTemplatesStateChange = this.onTemplatesStateChange.bind(this);
    this.onSelectTemplate = this.onSelectTemplate.bind(this);
    this.onArrow = this.onArrow.bind(this);
    this.onUpArrow = this.onUpArrow.bind(this);
    this.onDownArrow = this.onDownArrow.bind(this);
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

    window.requestAnimationFrame(() => {
      this.onTemplatesStateChange(this.getTemplatesState());
    });
  }

  onTemplatesStateChange(templatesState) {
    this.setState({ templatesState });
  }

  getTemplatesState(invalidate = true) {
    if (!invalidate) {
      return this.state.templatesState;
    }

    const { editorState } = this.state;
    const { responseTemplates } = this.props;

    const contentState = editorState.getCurrentContent();

    // get content as text
    const textContent = contentState.getPlainText();

    if (!textContent) {
      return null;
    }

    // search from response templates
    const foundTemplates = responseTemplates.filter(template => {
      return (
        template.name.includes(textContent) ||
        template.content.includes(textContent)
      );
    });

    if (foundTemplates.length > 0) {
      return {
        templates: foundTemplates,
        selectedIndex: 0
      };
    }

    return null;
  }

  onSelectTemplate() {
    const { templatesState } = this.state;
    const { templates, selectedIndex } = templatesState;
    const selectedTemplate = templates[selectedIndex];

    const editorState = createStateFromHTML(
      EditorState.createEmpty(),
      selectedTemplate.content
    );

    this.setState({ editorState, templatesState: null });
  }

  onArrow(e, nudgeAmount) {
    let templatesState = this.getTemplatesState(false);

    if (!templatesState) {
      return;
    }

    e.preventDefault();

    templatesState.selectedIndex += nudgeAmount;

    this.templatesState = templatesState;
    this.onTemplatesStateChange(templatesState);
  }

  onUpArrow(e) {
    this.onArrow(e, -1);
  }

  onDownArrow(e) {
    this.onArrow(e, 1);
  }

  // Render response templates suggestions
  renderTemplates() {
    const { templatesState } = this.state;

    if (!templatesState) {
      return null;
    }

    // Set suggestionState to SuggestionList.
    return <TemplateList suggestionsState={templatesState} />;
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
    if (e.key === 'Enter') {
      if (this.state.templatesState) {
        this.onSelectTemplate();

        return null;
      }

      // handle shift + enter in editor
      if (e.shiftKey) {
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
      onUpArrow: this.onUpArrow,
      onDownArrow: this.onDownArrow,
      plugins,
      pluginContent
    };

    return (
      <div>
        {this.renderTemplates()}
        <ErxesEditor {...props} />;
      </div>
    );
  }
}

Editor.propTypes = {
  onChange: PropTypes.func,
  onAddMention: PropTypes.func,
  onShifEnter: PropTypes.func,
  showMentions: PropTypes.bool,
  responseTemplate: PropTypes.string,
  responseTemplates: PropTypes.array,
  mentions: PropTypes.object // eslint-disable-line
};
