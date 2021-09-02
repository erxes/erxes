import createMentionPlugin, {
  defaultSuggestionsFilter
} from 'bat-draft-js-mention-plugin';
import {
  ContentState,
  EditorState,
  getDefaultKeyBinding,
  Modifier
} from 'draft-js';

import {
  createStateFromHTML,
  ErxesEditor,
  toHTML
} from 'modules/common/components/editor/Editor';
import React from 'react';

import { IResponseTemplate } from 'modules/settings/responseTemplates/types';
import TemplateList from './TemplateList';

type EditorProps = {
  currentConversation: string;
  defaultContent?: string;
  integrationKind: string;
  onChange: (content: string) => void;
  onAddMention: (mentions: any) => void;
  onAddMessage: () => void;
  onSearchChange: (value: string) => void;

  showMentions: boolean;
  responseTemplate: string;
  responseTemplates: IResponseTemplate[];
  handleFileInput: (e: React.FormEvent<HTMLInputElement>) => void;
  mentions: any;
  placeholder?: string | React.ReactNode;
};

type State = {
  editorState: EditorState;
  collectedMentions: any;
  suggestions: any;
  templatesState: any;
  hideTemplates: boolean;
};

const MentionEntry = props => {
  const { mention, theme, searchValue, ...parentProps } = props;

  return (
    <div {...parentProps}>
      <div className="mentionSuggestionsEntryContainer">
        <div className="mentionSuggestionsEntryContainerLeft">
          <img
            alt={mention.get('name')}
            role="presentation"
            src={mention.get('avatar') || '/images/avatar-colored.svg'}
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

  return entries.reduce(
    (result, [key, val]) => ({ ...result, [key]: val }),
    {}
  );
};

export default class Editor extends React.Component<EditorProps, State> {
  private mentionPlugin;

  constructor(props) {
    super(props);

    this.state = {
      editorState: createStateFromHTML(
        EditorState.createEmpty(),
        props.defaultContent
      ),
      collectedMentions: [],
      suggestions: this.props.mentions.toArray(),
      templatesState: null,
      hideTemplates: false
    };

    this.mentionPlugin = createMentionPlugin({
      mentionPrefix: '@'
    });
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

    // check switch conversation and fill default content
    if (nextProps.currentConversation !== this.props.currentConversation) {
      const editorState = createStateFromHTML(
        EditorState.createEmpty(),
        nextProps.defaultContent
      );

      this.setState({ editorState });
    }
  }

  onChange = editorState => {
    this.setState({ editorState, hideTemplates: false });

    this.props.onChange(this.getContent(editorState));

    window.requestAnimationFrame(() => {
      this.onTemplatesStateChange(this.getTemplatesState());
    });
  };

  onTemplatesStateChange = templatesState => {
    this.setState({ templatesState });
  };

  getTemplatesState = (invalidate: boolean = true) => {
    if (!invalidate) {
      return this.state.templatesState;
    }

    const { editorState } = this.state;
    const { responseTemplates } = this.props;

    const contentState = editorState.getCurrentContent();

    // get content as text
    const textContent = contentState.getPlainText().toLowerCase();

    if (!textContent) {
      return null;
    }

    // search from response templates
    const foundTemplates = responseTemplates.filter(
      template =>
        template.name.toLowerCase().includes(textContent) ||
        template.content.toLowerCase().includes(textContent)
    );

    if (foundTemplates.length > 0) {
      return {
        templates: foundTemplates.slice(0, 5),
        searchText: textContent,
        selectedIndex: 0
      };
    }

    return null;
  };

  changeEditorContent = (content: string) => {
    let editorState = createStateFromHTML(this.state.editorState, content);

    const selection = EditorState.moveSelectionToEnd(
      editorState
    ).getSelection();

    // calling onChange, because draftjs's onChange is not trigerring after
    // this setState
    this.props.onChange(this.getContent(editorState));

    const contentState = Modifier.insertText(
      editorState.getCurrentContent(),
      selection,
      ' '
    );

    const es = EditorState.push(editorState, contentState, 'insert-characters');

    editorState = EditorState.moveFocusToEnd(es);

    return this.setState({ editorState, templatesState: null });
  };

  onSelectTemplate = (index?: number) => {
    const { templatesState } = this.state;
    const { templates, selectedIndex } = templatesState;
    const selectedTemplate = templates[index || selectedIndex];

    if (!selectedTemplate) {
      return null;
    }

    return this.changeEditorContent(selectedTemplate.content);
  };

  onArrow = (e: KeyboardEvent, nudgeAmount: number) => {
    const templatesState = this.getTemplatesState(false);

    if (!templatesState) {
      return;
    }

    e.preventDefault();

    templatesState.selectedIndex += nudgeAmount;

    this.onTemplatesStateChange(templatesState);
  };

  onUpArrow = (e: KeyboardEvent) => {
    this.onArrow(e, -1);
  };

  onDownArrow = (e: KeyboardEvent) => {
    this.onArrow(e, 1);
  };

  onEscape = () => {
    this.setState({ hideTemplates: true });
  };

  // Render response templates suggestions
  renderTemplates() {
    const { templatesState, hideTemplates } = this.state;

    if (!templatesState || hideTemplates) {
      return null;
    }

    // Set suggestionState to SuggestionList.
    return (
      <TemplateList
        onSelect={this.onSelectTemplate}
        suggestionsState={templatesState}
      />
    );
  }

  onSearchChange = ({ value }) => {
    this.props.onSearchChange(value);

    this.setState({
      suggestions: defaultSuggestionsFilter(
        value,
        this.props.mentions.toArray()
      )
    });
  };

  onAddMention = object => {
    const mention = extractEntries(object);

    const collectedMentions = this.state.collectedMentions;

    collectedMentions.push(mention);

    this.setState({ collectedMentions });
  };

  getContent = (editorState: EditorState) => {
    let content = toHTML(editorState);

    // some mentioned people may have been deleted
    const finalMentions: any = [];

    // replace mention content
    this.state.collectedMentions.forEach(m => {
      const toFind = `@${m.name}`;
      const re = new RegExp(toFind, 'g');

      // collect only not removed mentions
      const findResult = content.match(re);

      if (findResult && findResult.length > 0) {
        finalMentions.push(m);
      }

      content = content.replace(
        re,
        `<b data-user-id='${m._id}'>@${m.name}</b>`
      );
    });

    // send mentioned user to parent
    this.props.onAddMention(finalMentions.map(mention => mention._id));

    return content;
  };

  keyBindingFn = e => {
    // handle new line
    if (e.key === 'Enter' && e.shiftKey) {
      return getDefaultKeyBinding(e);
    }

    // handle enter  in editor
    if (e.key === 'Enter') {
      // select response template
      if (this.state.templatesState && !this.state.hideTemplates) {
        this.onSelectTemplate();

        return null;
      }

      // call parent's method to save content
      this.props.onAddMessage();

      // clear content
      const state = this.state.editorState;

      const editorState = EditorState.push(
        state,
        ContentState.createFromText(''),
        'insert-characters'
      );

      this.setState({ editorState: EditorState.moveFocusToEnd(editorState) });

      return null;
    }

    return getDefaultKeyBinding(e);
  };

  render() {
    const { MentionSuggestions } = this.mentionPlugin;
    const plugins = [this.mentionPlugin];

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
      onEscape: this.onEscape,
      handleFileInput: this.props.handleFileInput,
      isTopPopup: true,
      plugins,
      pluginContent
    };

    return (
      <div>
        {this.renderTemplates()}
        <ErxesEditor {...props} />
      </div>
    );
  }
}
