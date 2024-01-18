export const getParsedMentions = (data: any) => {
  const mentions = (data.content || []).flatMap(getParsedMentions);
  if (data.type === 'mention') {
    mentions.push(data.attrs.id);
  }

  const uniqueMentions = [...new Set(mentions)] as any;

  return uniqueMentions;
};
