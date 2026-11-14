import { flip, offset, shift, size } from '@floating-ui/react';
import { FormattingToolbarController, useBlockNoteEditor } from '@blocknote/react';
import { ToolbarContents } from 'erxes-ui/modules/blocks/components/toolbar/ToolbarContents';

/**
 * Above the selection, or below it when what clips the toolbar leaves no room
 * there, so it never sits on the text it formats; across, it stays within the
 * editor and wraps to its width. BlockNote adds autoUpdate and hides the
 * toolbar while the selection is scrolled out of view.
 */
export const Toolbar = () => {
  const editor = useBlockNoteEditor();
  const inEditor = () => ({ boundary: editor.domElement ?? ('clippingAncestors' as const) });

  return (
    <FormattingToolbarController
      formattingToolbar={ToolbarContents}
      floatingUIOptions={{
        useFloatingOptions: {
          middleware: [
            offset(10),
            flip(),
            shift(inEditor),
            size(() => ({
              ...inEditor(),
              apply: ({ availableWidth, elements }) => {
                elements.floating.style.maxWidth = `${Math.floor(availableWidth)}px`;
              },
            })),
          ],
        },
      }}
    />
  );
};
