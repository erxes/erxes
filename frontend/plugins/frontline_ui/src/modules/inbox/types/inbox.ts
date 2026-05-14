interface TextBlock {
  type: string;
  text?: string;
  content?: TextBlock[];
}

interface Block {
  content?: TextBlock[];
  [key: string]: any;
}

export const getPreviewText = (content: string): string => {
  try {
    const parsed = JSON.parse(content) as Block | Block[];
    const blocks = Array.isArray(parsed) ? parsed : [parsed];

    return (
      blocks
        .flatMap((block) => {
          if (!block.content) return '';
          return extractTextFromContent(block.content);
        })
        .filter(Boolean)
        .join(' ')
        .trim() || 'Empty response'
    );
  } catch (e) {
    console.error('Error parsing response template content:', e);
    return typeof content === 'string' ? content : 'Empty response';
  }
};

const extractTextFromContent = (content: TextBlock[]): string[] => {
  return content.flatMap((item) => {
    if (item.type === 'text' && item.text) {
      return item.text;
    }
    if (Array.isArray(item.content)) {
      return extractTextFromContent(item.content);
    }
    return '';
  });
};
