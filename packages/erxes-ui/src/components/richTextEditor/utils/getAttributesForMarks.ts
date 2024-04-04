import { getMarkType } from '@tiptap/core';
import { Mark, MarkType } from '@tiptap/pm/model';
import { EditorState } from '@tiptap/pm/state';

/**
 * Get the attributes of all currently selected marks of the given type or
 * name.
 *
 * Returns an array of Records, with an entry for each matching mark that is
 * currently selected.
 *
 * Based directly on Tiptap's getMarkAttributes
 * (https://github.com/ueberdosis/tiptap/blob/f387ad3dd4c2b30eaea33fb0ba0b42e0cd39263b/packages/core/src/helpers/getMarkAttributes.ts),
 * but returns results for each of the matching marks, rather than just the
 * first. See related: https://github.com/ueberdosis/tiptap/issues/3481
 */
export function getAttributesForMarks(
  state: EditorState,
  typeOrName: string | MarkType
): Array<Record<string, any>> {
  const type = getMarkType(typeOrName, state.schema);
  const { from, to, empty } = state.selection;
  const marks: Mark[] = [];

  if (empty) {
    if (state.storedMarks) {
      marks.push(...state.storedMarks);
    }

    marks.push(...state.selection.$from.marks());
  } else {
    state.doc.nodesBetween(from, to, node => {
      marks.push(...node.marks);
    });
  }

  return marks
    .filter(markItem => markItem.type.name === type.name)
    .map(mark => ({ ...mark.attrs }));
}
