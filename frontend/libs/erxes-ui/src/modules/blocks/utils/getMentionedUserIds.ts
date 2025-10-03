export const getMentionedUserIds = (content: any) => {
  if (!content) return [];
  const mentionedUserIds: string[] = [];
  const flatContent = content.map((block: any) => [...block.content]).flat();
  flatContent.forEach((content: any) => {
    if (content.type === 'mention') {
      mentionedUserIds.push(content.props._id);
    }
  });
  return mentionedUserIds;
};
