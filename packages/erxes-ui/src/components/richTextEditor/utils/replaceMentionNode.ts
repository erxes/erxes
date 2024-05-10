import { JSONContent } from '@tiptap/core';

export function replaceSpanWithMention(doc: JSONContent) {
  function replaceMentions(node: JSONContent) {
    if (node.type === 'text' && node.marks) {
      // Filter marks with type spanMark and data-type mention
      const mentionMarks = node.marks.find(
        (mark) =>
          mark.type === 'spanMark' && mark.attrs?.['data-type'] === 'mention',
      );
      const id = mentionMarks?.attrs?.['data-id'];
      const label = mentionMarks?.attrs?.['data-label'];
      if (id && label) {
        return {
          type: 'mention',
          attrs: { id, label },
        };
      }
    } else if (node.content) {
      // Recursively traverse through the content
      return {
        ...node,
        content: node.content.map(replaceMentions),
      };
    }
    return node;
  }

  return replaceMentions(doc);
}

export function replaceMentionsWithText(doc: JSONContent) {
  function replaceMentions(node: JSONContent) {
    if (node.type === 'mention') {
      return { type: 'text', text: node?.attrs?.label || '' };
    } else if (node.type === 'text' && node.marks) {
      // Check if the text node has marks
      const filteredMarks = node.marks.filter(
        (mark) =>
          mark.type === 'spanMark' && mark?.attrs?.['data-type'] === 'mention',
      );
      if (filteredMarks.length > 0) {
        // If the text node has spanMark with type mention, replace it with text
        return {
          type: 'text',
          text:
            node.marks.find(
              (mark) =>
                mark.type === 'spanMark' &&
                mark?.attrs?.['data-type'] === 'mention',
            )?.attrs?.['data-label'] || node.text,
        };
      }
    } else if (node.content) {
      // Recursively traverse through the content
      return {
        ...node,
        content: node.content.map(replaceMentions),
      };
    }
    return node;
  }

  return replaceMentions(doc);
}
