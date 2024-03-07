import { Subscript as TiptapSubscript } from '@tiptap/extension-subscript';
// Make subscript and superscript mutually exclusive
// https://github.com/ueberdosis/tiptap/pull/1436#issuecomment-1031937768

export const Subscript = TiptapSubscript.extend({
  excludes: 'superscript',
});
