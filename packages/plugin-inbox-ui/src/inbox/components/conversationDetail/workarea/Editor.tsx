import { IResponseTemplate } from '../../../../settings/responseTemplates/types';
import { MentionSuggestionParams } from '@erxes/ui/src/components/richTextEditor/utils/getMentionSuggestions';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import {
  EditorMethods,
  RichTextEditor,
} from '@erxes/ui/src/components/richTextEditor/TEditor';
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
  limit?: number;
  mentionSuggestion?: MentionSuggestionParams;
};

type State = {
  collectedMentions: any;
  templatesState: any;
  hideTemplates: boolean;
};

const Editor = forwardRef(
  (props: EditorProps, ref: React.ForwardedRef<EditorMethods>) => {
    const [state, setState] = useState<State>({
      collectedMentions: [],
      templatesState: null,
      hideTemplates: props.showMentions,
    });

    useEffect(() => {
      const defaultContent = props.defaultContent || '';
      props.onChange(defaultContent);
    }, [props.currentConversation, props.defaultContent]);

    useEffect(() => {
      setState((prevState) => ({
        ...prevState,
        hideTemplates: props.showMentions,
      }));
    }, [props.showMentions]);

    const onChange = useCallback((content: string) => {
      props.onChange(content);
      onTemplatesStateChange(getTemplatesState());
      // window.requestAnimationFrame(() => {
      //   onTemplatesStateChange(getTemplatesState());
      // });
    }, []);

    const onTemplatesStateChange = (templatesState) => {
      setState((prevState) => ({ ...prevState, templatesState }));
    };

    const getTemplatesState = (invalidate: boolean = true) => {
      if (!invalidate) {
        return state.templatesState;
      }

      const { responseTemplates, content } = props;
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
      props.onChange(content);
      return setState((prevState) => ({ ...prevState, templatesState: null }));
    };

    const onSelectTemplate = (index?: number) => {
      const { templatesState } = state;
      const { templates, selectedIndex } = templatesState;
      const selectedTemplate = templates[index || selectedIndex];

      if (!selectedTemplate) {
        return null;
      }

      return changeEditorContent(selectedTemplate.content);
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
          placeholder={props.placeholder}
          integrationKind={props.integrationKind}
          showMentions={props.showMentions}
          {...(props.showMentions && {
            mentionSuggestion: props.mentionSuggestion,
          })}
          content={props.content}
          onChange={onChange}
          autoGrow={true}
          autoGrowMinHeight={100}
          autoGrowMaxHeight="55vh"
          limit={props.limit}
        />
      </div>
    );
  },
);
export default Editor;
