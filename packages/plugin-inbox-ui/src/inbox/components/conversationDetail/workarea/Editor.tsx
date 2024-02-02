import { IResponseTemplate } from '../../../../settings/responseTemplates/types';
import { MentionSuggestionParams } from '@erxes/ui/src/components/richTextEditor/utils/getMentionSuggestions';
import React from 'react';
import { RichTextEditor } from '@erxes/ui/src/components/richTextEditor/TEditor';
import TemplateList from './TemplateList';

type EditorProps = {
  currentConversation: string;
  defaultContent?: string;
  integrationKind: string;
  onChange: (content: string) => void;
  showMentions: boolean;
  responseTemplates: IResponseTemplate[];
  placeholder?: string;
  content: string;
  mentionSuggestion?: MentionSuggestionParams;
};

type State = {
  collectedMentions: any;
  templatesState: any;
  hideTemplates: boolean;
};

export default class Editor extends React.Component<EditorProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      collectedMentions: [],
      templatesState: null,
      hideTemplates: this.props.showMentions,
    };
  }

  componentWillReceiveProps(nextProps) {
    // check switch conversation and fill default content
    if (nextProps.currentConversation !== this.props.currentConversation) {
      const defaultContent = nextProps.defaultContent;
      this.props.onChange(defaultContent);
    }
  }

  componentDidUpdate(
    prevProps: Readonly<EditorProps>,
    prevState: Readonly<State>,
  ): void {
    if (
      this.props.defaultContent !== prevProps.defaultContent &&
      !this.props?.defaultContent &&
      this.props.content.length
    ) {
      this.props.onChange(this.props.defaultContent || '');
    }
    if (prevProps.showMentions !== this.props.showMentions) {
      this.setState({ hideTemplates: this.props.showMentions });
    }
  }

  onChange = (content: string) => {
    this.props.onChange(content);

    window.requestAnimationFrame(() => {
      this.onTemplatesStateChange(this.getTemplatesState());
    });
  };

  onTemplatesStateChange = (templatesState) => {
    this.setState({ templatesState });
  };

  getTemplatesState = (invalidate: boolean = true) => {
    if (!invalidate) {
      return this.state.templatesState;
    }

    const { responseTemplates, content } = this.props;
    // get html content as text
    const textContent = content.toLowerCase().replace(/<[^>]+>/g, '');

    if (!textContent) {
      return null;
    }

    // search from response templates
    const foundTemplates = responseTemplates.filter(
      (template) =>
        template.name.toLowerCase().includes(textContent) ||
        template.content.toLowerCase().includes(textContent),
    );

    if (foundTemplates.length > 0) {
      return {
        templates: foundTemplates.slice(0, 5),
        searchText: textContent,
        selectedIndex: 0,
      };
    }

    return null;
  };

  changeEditorContent = (content: string) => {
    // calling onChange, because draftjs's onChange is not trigerring after
    // this setState
    this.props.onChange(content);

    return this.setState({ templatesState: null });
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

  render() {
    return (
      <div>
        {this.renderTemplates()}
        <RichTextEditor
          placeholder={this.props.placeholder}
          integrationKind={this.props.integrationKind}
          showMentions={this.props.showMentions}
          {...(this.props.showMentions && {
            mentionSuggestion: this.props.mentionSuggestion,
          })}
          content={this.props.content}
          onChange={this.onChange}
          autoGrow={true}
          autoGrowMinHeight={100}
          autoGrowMaxHeight="55vh"
        />
      </div>
    );
  }
}
