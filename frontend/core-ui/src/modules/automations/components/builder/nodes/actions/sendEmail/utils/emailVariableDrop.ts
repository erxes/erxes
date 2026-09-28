import { Editor, Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import {
  getAutomationVariableDragData,
  TAutomationVariableDragPayload,
} from 'ui-modules';

export type TEmailVariableDrop = {
  payload: TAutomationVariableDragPayload;
  /** The editor that received it, so the handler needs no state of its own. */
  editor: Editor;
  position?: number;
};

/**
 * Lets an output variable be dragged from the sidebar into the email.
 *
 * What to do with it is the caller's: an output variable has to look like
 * every other field while still carrying its token, because it is filled in
 * after the body is rendered — by the step that knows what earlier steps
 * produced.
 */
export const createEmailOutputVariableDrop = (
  onDropVariable: (drop: TEmailVariableDrop) => void,
) =>
  Extension.create({
    name: 'emailOutputVariableDrop',

    addProseMirrorPlugins() {
      const { editor } = this;

      return [
        new Plugin({
          props: {
            handleDOMEvents: {
              dragover: (_view, event) => {
                if (!event.dataTransfer) {
                  return false;
                }

                if (!getAutomationVariableDragData(event.dataTransfer)) {
                  return false;
                }

                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';

                return true;
              },

              drop: (view, event) => {
                if (!event.dataTransfer) {
                  return false;
                }

                const payload = getAutomationVariableDragData(
                  event.dataTransfer,
                );

                if (!payload) {
                  return false;
                }

                event.preventDefault();

                // Where it was dropped, not where the caret happened to be.
                const dropped = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });

                onDropVariable({ payload, editor, position: dropped?.pos });

                return true;
              },
            },
          },
        }),
      ];
    },
  });
