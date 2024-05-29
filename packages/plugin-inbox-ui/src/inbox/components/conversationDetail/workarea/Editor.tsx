import { IResponseTemplate } from '../../../../settings/responseTemplates/types';
import { MentionSuggestionParams } from '@erxes/ui/src/components/richTextEditor/utils/getMentionSuggestions';
import React, { forwardRef, useEffect, useState } from 'react';
import {
  EditorMethods,
  RichTextEditor,
} from '@erxes/ui/src/components/richTextEditor/TEditor';
import TemplateList from './TemplateList';

type EditorProps = {
  currentConversation: string;
  integrationKind: string;
  content: string;
  onChange: (content: string) => void;
  showMentions: boolean;
  responseTemplates: IResponseTemplate[];
  placeholder?: string;
  limit?: number;
  mentionSuggestion?: MentionSuggestionParams;
  onCtrlEnter?: () => void;
};

type State = {
  collectedMentions: any;
  templatesState: any;
  hideTemplates: boolean;
};

const Editor = forwardRef(
  (props: EditorProps, ref: React.ForwardedRef<EditorMethods>) => {
    const {
      showMentions,
      content,
      responseTemplates,
      currentConversation,
      placeholder,
      integrationKind,
      mentionSuggestion,
      onChange,
      limit,
      onCtrlEnter,
    } = props;

    const [state, setState] = useState<State>({
      collectedMentions: [],
      templatesState: null,
      hideTemplates: props.showMentions,
    });

    useEffect(() => {
      setState((prevState) => ({
        ...prevState,
        hideTemplates: showMentions,
      }));
    }, [showMentions]);

    useEffect(() => {
      window.requestAnimationFrame(() => {
        onTemplatesStateChange(getTemplatesState());
      });
    }, [content, responseTemplates]);

    const onTemplatesStateChange = (templatesState: any) => {
      setState((prevState) => ({ ...prevState, templatesState }));
    };

    const getTemplatesState = () => {
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

    const changeEditorContent = (content: string) => {
      onChange(content);
      setState((prevState) => ({ ...prevState, templatesState: null }));
    };

    const onSelectTemplate = (index?: number) => {
      const { templatesState } = state;
      const { templates, selectedIndex } = templatesState;
      const selectedTemplate = templates[index || selectedIndex];

      if (!selectedTemplate) {
        return null;
      }

      changeEditorContent(`${selectedTemplate.content}\n`);
    };

    // Render response templates suggestions
    const renderTemplates = () => {
      const { templatesState, hideTemplates } = state;

      if (!templatesState || hideTemplates) {
        return null;
      }

      // Set suggestionState to SuggestionList.
      return (
        <TemplateList
          onSelect={onSelectTemplate}
          suggestionsState={templatesState}
        />
      );
    };

    return (
      <div>
        {renderTemplates()}
        <RichTextEditor
          ref={ref}
          name={currentConversation}
          placeholder={placeholder}
          integrationKind={integrationKind}
          showMentions={showMentions}
          mentionSuggestion={mentionSuggestion}
          content={content}
          onChange={onChange}
          autoGrow={true}
          autoGrowMinHeight={100}
          autoGrowMaxHeight="55vh"
          limit={limit}
          onCtrlEnter={onCtrlEnter}
        />
      </div>
    );
  },
);
export default Editor;
