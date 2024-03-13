import { ReactRenderer } from '@tiptap/react';
import { SuggestionOptions } from '@tiptap/suggestion';
import tippy, { GetReferenceClientRect } from 'tippy.js';
import { MentionList } from '../nodes/Mention.tsx';
import { IMentionUser } from '../../../types';

export type MentionSuggestionParams = {
  fetchMentions: (args: any) => Promise<any>;
  getVariables: (query: string) => Record<string, any>;
  extractFunction: (queryResult: any) => IMentionUser[];
};

export function getMentionSuggestions({
  getVariables,
  fetchMentions,
  extractFunction,
}: MentionSuggestionParams): Omit<SuggestionOptions, 'editor'> {
  return {
    items: async ({ query }) => {
      try {
        const { data } = await fetchMentions({
          variables: getVariables(query),
        });

        // Extract the mentions from the query data or filter or process the fetched data as needed
        const mentionData = extractFunction(data);

        return mentionData;
      } catch (error) {
        return [];
      }
    },
    render: () => {
      let component: ReactRenderer<any>;
      let popup: InstanceType<any> | null = null;

      return {
        onStart: (props) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }
          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as GetReferenceClientRect,
            appendTo: () => document.body,
            maxWidth: '100%',
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'top-start',
            onShow: () => {
              // If a user deletes the @ symbol quickly after
              // typing it, the node we want to append the popup
              // to won't exist so we check to ensure it is there
              // prior to mounting the popup to the DOM
              try {
                props.clientRect?.();
              } catch {
                return false;
              }
            },
          });
        },

        onUpdate(props) {
          component.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup?.[0]?.setProps({
            getReferenceClientRect: props.clientRect as GetReferenceClientRect,
          });
        },

        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup?.[0].hide();

            return true;
          }

          return component.ref?.onKeyDown(props);
        },

        onExit() {
          if (!popup || !popup?.[0] || !component) {
            return;
          }

          popup?.[0].destroy();
          component.destroy();
        },
      };
    },
  };
}
