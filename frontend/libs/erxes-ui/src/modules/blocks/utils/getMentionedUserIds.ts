type InlineContent = { type: string; props: Record<string, string> };
type BlockLike = { content?: InlineContent[] };

export const getMentionedUserIds = (content: BlockLike[]) => {
  if (!content) return [];
  const mentionedUserIds: string[] = [];
  const flatContent = content.flatMap((block) =>
    Array.isArray(block.content) ? block.content : [],
  );
  flatContent.forEach((item) => {
    if (item.type === 'mention') {
      mentionedUserIds.push(item.props._id);
    }
  });
  return mentionedUserIds;
};
