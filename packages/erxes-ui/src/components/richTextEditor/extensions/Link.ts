import TiptapLink from '@tiptap/extension-link';

// Don't treat the end cursor as "inclusive" of the Link mark, so that users can
// actually "exit" a link if it's the last element in the editor (see
// https://tiptap.dev/api/schema#inclusive and
// https://github.com/ueberdosis/tiptap/issues/2572#issuecomment-1055827817).
// This also makes the `isActive` behavior somewhat more consistent with
// `extendMarkRange` (as described here
// https://github.com/ueberdosis/tiptap/issues/2535), since a link won't be
// treated as active if the cursor is at the end of the link. One caveat of this
// approach: it seems that after creating or editing a link with the link menu
// (as opposed to having a link created via autolink), the next typed character
// will be part of the link unexpectedly, and subsequent characters will not be.
// This may have to do with how we're using `insertContent` and `setLink` in
// the LinkBubbleMenu, but I can't figure out an alternative approach that
// avoids the issue. This is arguably better than being "stuck" in the link
// without being able to leave it, but it is still not quite right. See the
// related open issues here:
// https://github.com/ueberdosis/tiptap/issues/2571,
// https://github.com/ueberdosis/tiptap/issues/2572, and
// https://github.com/ueberdosis/tiptap/issues/514
export const Link = TiptapLink.extend({
  inclusive: false,
  addAttributes() {
    return {
      href: {
        default: null,
      },
      target: {
        default: this.options.HTMLAttributes.target,
      },
      rel: {
        default: this.options.HTMLAttributes.rel,
      },
      style: {
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
        },
      },
    };
  },
}).configure({
  // autolink is generally useful for changing text into links if they
  // appear to be URLs (like someone types in literally "example.com"),
  // though it comes with the caveat that if you then *remove* the link
  // from the text, and then add a space or newline directly after the
  // text, autolink will turn the text back into a link again. Not ideal,
  // but probably still overall worth having autolink enabled, and that's
  // how a lot of other tools behave as well.
  autolink: true,
  linkOnPaste: true,
  openOnClick: false,
});
