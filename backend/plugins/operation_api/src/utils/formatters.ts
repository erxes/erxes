const isObject = (val: unknown): val is Record<string, unknown> => {
  return typeof val === 'object' && val !== null;
};

export const cleanDescription = (description: unknown): string => {
  if (!description) {
    return '';
  }

  if (
    typeof description === 'string' &&
    (description.startsWith('[') || description.startsWith('{'))
  ) {
    try {
      const parsed = JSON.parse(description);
      const isArray = Array.isArray(parsed);
      const isObj = isObject(parsed);

      if (isArray || isObj) {
        const blocks = isArray ? parsed : [parsed];

        const extractText = (content: unknown): string => {
          if (!Array.isArray(content)) {
            return '';
          }
          return content
            .map((item) => {
              if (isObject(item)) {
                if (item.type === 'link') {
                  return extractText(item.content);
                }
                return typeof item.text === 'string' ? item.text : '';
              }
              return '';
            })
            .join('');
        };

        const processBlock = (block: unknown): string => {
          if (!isObject(block)) {
            return '';
          }
          let text = '';
          if (block.content) {
            text += extractText(block.content);
          }
          if (Array.isArray(block.children)) {
            const childrenText = block.children
              .map(processBlock)
              .filter(Boolean)
              .join('\n');
            if (childrenText) {
              text += '\n' + childrenText;
            }
          }
          return text;
        };

        return blocks.map(processBlock).filter(Boolean).join('\n');
      }
    } catch {
      // ignore
    }
  }

  return String(description);
};
