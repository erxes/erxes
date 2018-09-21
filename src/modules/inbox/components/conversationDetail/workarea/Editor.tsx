import createMentionPlugin, {
  defaultSuggestionsFilter
} from "bat-draft-js-mention-plugin";
import {
  ContentState,
  EditorState,
  getDefaultKeyBinding,
  Modifier
} from "draft-js";
import highlighter from "fuzzysearch-highlight";
import {
  createStateFromHTML,
  ErxesEditor,
  toHTML
} from "modules/common/components/editor/Editor";
import * as React from "react";
import strip from "strip";

import {
  ResponseSuggestionItem,
  ResponseSuggestions
} from "modules/inbox/styles";

type EditorProps = {
  onChange: (editorState: any) => void;
  onAddMention: (mentions: any) => void;
  onShifEnter: () => void;
  showMentions: boolean;
  responseTemplate: string;
  responseTemplates: any;
  handleFileInput: (e: any) => void;
  mentions: any;
  placeholder?: string | React.ReactNode;
};

type State = {
  editorState: any;
  collectedMentions: any;
  suggestions: any;
  templatesState: any;
};

type TemplateListProps = {
  suggestionsState: any;
  onSelect: (name: string) => void;
};

const MentionEntry = props => {
  const { mention, theme, searchValue, ...parentProps } = props;

  return (
    <div {...parentProps}>
      <div className="mentionSuggestionsEntryContainer">
        <div className="mentionSuggestionsEntryContainerLeft">
          <img
            alt={mention.get("name")}
            role="presentation"
            src={mention.get("avatar") || "/images/avatar-colored.svg"}
            className="mentionSuggestionsEntryAvatar"
          />
        </div>

        <div className="mentionSuggestionsEntryContainerRight">
          <div className="mentionSuggestionsEntryText">
            {mention.get("name")}
          </div>

          <div className="mentionSuggestionsEntryTitle">
            {mention.get("title")}
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

// response templates
class TemplateList extends React.Component<TemplateListProps, {}> {
  normalizeIndex(selectedIndex, max) {
    let index = selectedIndex % max;

    if (index < 0) {
      index += max;
    }

    return index;
  }

  render() {
    const { suggestionsState, onSelect } = this.props;

    const { selectedIndex, searchText, templates } = suggestionsState;

    if (!templates) {
      return null;
    }

    const normalizedIndex = this.normalizeIndex(
      selectedIndex,
      templates.length
    );

    return (
      <ResponseSuggestions>
        {templates.map((template, index) => {
          const style: any = {};

          if (normalizedIndex === index) {
            style.backgroundColor = "#5629B6";
            style.color = "#ffffff";
          }

          return (
            <ResponseSuggestionItem
              key={template._id}
              onClick={() => onSelect(index)}
              style={style}
            >
              <span
                style={{ fontWeight: "bold" }}
                dangerouslySetInnerHTML={{
                  __html: highlighter(searchText, template.name)
                }}
              />
              <span
                dangerouslySetInnerHTML={{
                  __html: highlighter(searchText, strip(template.content))
                }}
              />
            </ResponseSuggestionItem>
          );
        }, this)}
      </ResponseSuggestions>
    );
  }
}

export default class Editor extends React.Component<EditorProps, State> {
  private mentionPlugin;

  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
      collectedMentions: [],
      suggestions: this.props.mentions.toArray(),
      templatesState: null
    };

    this.mentionPlugin = createMentionPlugin({
      mentionPrefix: "@"
    });

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
  }

  onSelectTemplate(index?: string) {
    const { templatesState } = this.state;
    const { templates, selectedIndex } = templatesState;
    const selectedTemplate = templates[index || selectedIndex];

    if (!selectedTemplate) {
      return null;
    }

    let editorState = createStateFromHTML(
      EditorState.createEmpty(),
      selectedTemplate.content
    );

    const selection = EditorState.moveSelectionToEnd(
      editorState
    ).getSelection();
    const contentState = Modifier.insertText(
      editorState.getCurrentContent(),
      selection,
      " "
    );
    const es = EditorState.push(editorState, contentState, "insert-characters");

    editorState = EditorState.moveFocusToEnd(es);

    return this.setState({ editorState, templatesState: null });
  }

  onArrow(e, nudgeAmount) {
    const templatesState = this.getTemplatesState(false);

    if (!templatesState) {
      return;
    }

    e.preventDefault();

    templatesState.selectedIndex += nudgeAmount;

    this.onTemplatesStateChange(templatesState);
  }

  onUpArrow(e: any) {
    this.onArrow(e, -1);
  }

  onDownArrow(e: any) {
    this.onArrow(e, 1);
  }

  // Render response templates suggestions
  renderTemplates() {
    const { templatesState } = this.state;

    if (!templatesState) {
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
    const finalMentions: any = [];

    // replace mention content
    this.state.collectedMentions.forEach(m => {
      const toFind = `@${m.name}`;
      const re = new RegExp(toFind, "g");

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
  }

  keyBindingFn(e: any) {
    // handle new line
    if (e.key === "Enter" && e.shiftKey) {
      return getDefaultKeyBinding(e);
    }

    // handle enter  in editor
    if (e.key === "Enter") {
      // select response template
      if (this.state.templatesState) {
        this.onSelectTemplate();

        return null;
      }

      // call parent's method to save content
      this.props.onShifEnter();

      // clear content
      const state = this.state.editorState;

      const editorState = EditorState.push(
        state,
        ContentState.createFromText(""),
        "insert-characters"
      );

      this.setState({ editorState: EditorState.moveFocusToEnd(editorState) });

      return null;
    }

    return getDefaultKeyBinding(e);
  }

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
      handleFileInput: this.props.handleFileInput,
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
