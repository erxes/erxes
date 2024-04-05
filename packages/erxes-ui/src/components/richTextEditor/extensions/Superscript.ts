import { Superscript as TiptapSuperscript } from '@tiptap/extension-superscript';

export const Superscript = TiptapSuperscript.extend({
  excludes: 'subscript',
});
