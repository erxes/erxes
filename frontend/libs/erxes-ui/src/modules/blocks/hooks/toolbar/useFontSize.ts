import {
  useBlockNoteEditor,
  useEditorContentOrSelectionChange,
} from '@blocknote/react';
import type { Node } from '@tiptap/pm/model';
import { useState } from 'react';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types';
import type { FontSizeState } from 'erxes-ui/modules/blocks/types/toolbar/FontSize';

const isTextAttribute = (node: Node): boolean =>
  node.type.name === 'attribute' && node.attrs.value !== 'barcode';

const getCurrentSize = (editor: IBlockEditor): string =>
  editor.transact(({ doc, selection }) => {
    if (!selection.empty) {
      const sizes = new Set<string>();
      let hasText = false;

      selection.ranges.forEach(({ $from, $to }) => {
        doc.nodesBetween($from.pos, $to.pos, (node) => {
          if (node.isText) hasText = true;
          if (isTextAttribute(node)) sizes.add(node.attrs.fontSize);
        });
      });

      if (!hasText && sizes.size > 0) {
        return sizes.size === 1 ? sizes.values().next().value ?? '' : '';
      }
    }

    return editor.getActiveStyles().fontSize || '';
  });

export const useFontSize = (): FontSizeState => {
  const editor = useBlockNoteEditor<
    IBlockEditor['schema']['blockSchema'],
    IBlockEditor['schema']['inlineContentSchema'],
    IBlockEditor['schema']['styleSchema']
  >();
  const [currentSize, setCurrentSize] = useState(() => getCurrentSize(editor));
  const [isFileBlock, setIsFileBlock] = useState(() => {
    const { block } = editor.getTextCursorPosition();
    return !!editor.schema.blockSpecs[block.type].config.isFileBlock;
  });

  useEditorContentOrSelectionChange(() => {
    setCurrentSize(getCurrentSize(editor));
    const { block } = editor.getTextCursorPosition();
    setIsFileBlock(!!editor.schema.blockSpecs[block.type].config.isFileBlock);
  }, editor);

  const handleSizeChange = (size: string): void => {
    if (editor.prosemirrorState.selection.empty) {
      if (size) {
        editor.addStyles({ fontSize: size });
      } else {
        editor.removeStyles({ fontSize: '' });
      }
      editor.focus();
      return;
    }

    editor.transact((tr) => {
      const fontSizeMark = tr.doc.type.schema.marks.fontSize;
      for (const { $from, $to } of tr.selection.ranges) {
        if (size) {
          tr.addMark(
            $from.pos,
            $to.pos,
            fontSizeMark.create({ stringValue: size }),
          );
        } else {
          tr.removeMark($from.pos, $to.pos, fontSizeMark);
        }
        tr.doc.nodesBetween($from.pos, $to.pos, (node, position) => {
          if (isTextAttribute(node) && node.attrs.fontSize !== size) {
            tr.setNodeAttribute(position, 'fontSize', size);
          }
        });
      }
    });
    editor.focus();
  };

  return { currentSize, isFileBlock, handleSizeChange };
};
