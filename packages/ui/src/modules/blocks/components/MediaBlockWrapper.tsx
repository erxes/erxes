import { FilePanelExtension } from '@blocknote/core/extensions';
import { useBlockNoteEditor, useDictionary, useExtension } from '@blocknote/react';
import type { PointerEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { cn } from 'erxes-ui/lib/utils';
import { useBlockEditorEditable } from 'erxes-ui/modules/blocks/hooks/useBlockEditorEditable';

const MIN_WIDTH = 64;

type ResizeSide = 'left' | 'right';

type MediaBlock = {
  id: string;
  type: string;
  props: { url: string; caption: string; previewWidth?: number; textAlignment: string };
};

// Opens the file panel, where the user uploads or embeds the media.
const AddMediaButton = ({ block, icon }: { block: MediaBlock; icon: ReactNode }) => {
  const editor = useBlockNoteEditor();
  const dictionary = useDictionary();
  const filePanel = useExtension(FilePanelExtension);

  return (
    <div className="bn-file-block-content-wrapper">
      <button
        type="button"
        className="bn-add-file-button w-full border-0 text-left font-[inherit]"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (editor.isEditable) filePanel.showMenu(block.id);
        }}
      >
        <div className="bn-add-file-button-icon">{icon}</div>
        <div className="bn-add-file-button-text">
          {dictionary.file_blocks.add_button_text[block.type]}
        </div>
      </button>
    </div>
  );
};

/**
 * The frame of the image and video blocks: an add button until the block has a url,
 * then the media with resize handles and its caption. BlockNote's
 * ResizableFileBlockWrapper renders the same, but its props only type-check for the
 * `file` block.
 */
export const MediaBlockWrapper = ({
  block,
  buttonIcon,
  onResize,
  children,
}: {
  block: MediaBlock;
  buttonIcon: ReactNode;
  onResize: (previewWidth: number) => void;
  children: ReactNode;
}) => {
  const editor = useBlockNoteEditor();
  const editable = useBlockEditorEditable(editor.isEditable);
  const mediaRef = useRef<HTMLDivElement>(null);

  const [drag, setDrag] = useState<{
    side: ResizeSide;
    startX: number;
    startWidth: number;
    width: number;
  }>();

  if (!block.props.url) return <AddMediaButton block={block} icon={buttonIcon} />;

  const startResize = (side: ResizeSide) => (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const startWidth = mediaRef.current?.clientWidth ?? MIN_WIDTH;
    setDrag({ side, startX: event.clientX, startWidth, width: startWidth });
  };

  const resize = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;

    const moved = drag.side === 'left' ? drag.startX - event.clientX : event.clientX - drag.startX;
    // A centred block grows on both sides.
    const grown = drag.startWidth + moved * (block.props.textAlignment === 'center' ? 2 : 1);
    const width = Math.max(grown, MIN_WIDTH);
    // An editor that isn't laid out yet has no width and sets no limit.
    const editorWidth = editor.domElement?.firstElementChild?.clientWidth;

    setDrag({ ...drag, width: editorWidth ? Math.min(width, editorWidth) : width });
  };

  const endResize = () => {
    if (!drag) return;

    onResize(drag.width);
    setDrag(undefined);
  };

  const width = drag?.width ?? block.props.previewWidth;
  const Wrapper = block.props.caption ? 'figure' : 'div';

  return (
    <Wrapper
      className="bn-file-block-content-wrapper group/media"
      style={{ width: width ? `${width}px` : 'fit-content' }}
    >
      <div className="bn-visual-media-wrapper relative" ref={mediaRef}>
        {children}
        {/* An embedded player gets the pointer events over it, so hovering it shows nothing:
            the handles stay in place, invisible, and show when the pointer reaches one. */}
        {editable &&
          (['left', 'right'] as const).map((side) => (
            <div
              key={side}
              className={cn(
                'bn-resize-handle opacity-0 group-hover/media:opacity-100 hover:opacity-100 pointer-coarse:opacity-100',
                drag && 'opacity-100',
              )}
              style={{ [side]: '4px' }}
              onPointerDown={startResize(side)}
              onPointerMove={resize}
              onPointerUp={endResize}
            />
          ))}
        {/* An embedded player is its own document, so it would swallow the pointer while resizing. */}
        {drag && <div className="absolute inset-0" />}
      </div>
      {block.props.caption && (
        <figcaption className="bn-file-caption">{block.props.caption}</figcaption>
      )}
    </Wrapper>
  );
};
