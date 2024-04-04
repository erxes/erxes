export const getParsedMentions = (data: any) => {
  const mentionIds = new Set();

  // Recursive function to traverse nested content
  function traverseContent(content: any[]) {
    content.forEach((item: any) => {
      if (item.type === 'text' && Array.isArray(item.marks)) {
        item.marks.forEach((mark: any) => {
          if (
            mark.type === 'spanMark' &&
            mark.attrs &&
            mark.attrs['data-type'] === 'mention'
          ) {
            mentionIds.add(mark.attrs['data-id']);
          }
        });
      } else if (Array.isArray(item.content)) {
        traverseContent(item.content);
      }
    });
  }

  traverseContent(data.content || []);
  return Array.from(mentionIds); // Convert Set to array
};
