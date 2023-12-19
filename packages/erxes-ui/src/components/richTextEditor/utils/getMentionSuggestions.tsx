import { ReactRenderer } from '@tiptap/react';
import { SuggestionOptions } from '@tiptap/suggestion';
import tippy, { GetReferenceClientRect } from 'tippy.js';
import { MentionList } from '../nodes/Mention.tsx';
import { IMentionUser } from '../../../types';

export function getMentionSuggestions(
  variables: IMentionUser[] = []
): Omit<SuggestionOptions, 'editor'> {
  return {
    items: ({ query }) => {
      return variables
        .filter(item =>
          item?.fullName?.toLowerCase()?.startsWith(query.toLowerCase())
        )
        .slice(0, 5);
    },

    render: () => {
      let component: ReactRenderer<any>;
      let popup: InstanceType<any> | null = null;

      return {
        onStart: props => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor
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
            placement: 'bottom-start'
          });
        },

        onUpdate(props) {
          component.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup?.[0]?.setProps({
            getReferenceClientRect: props.clientRect as GetReferenceClientRect
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
        }
      };
    }
  };
}
