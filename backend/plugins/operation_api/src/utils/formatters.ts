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
      const parsed = JSON.parse(description) as unknown;
      const isArray = Array.isArray(parsed);
      const isObj = isObject(parsed);

      if (isArray || isObj) {
        const blocks: unknown[] = isArray ? (parsed as unknown[]) : [parsed];

        /** Extracts plain text from an array of slate blocks recursively. */
        const extractText = (content: unknown): string => {
          if (!Array.isArray(content)) {
            return '';
          }
          const contentArray: unknown[] = content;
          return contentArray
            .map((item: unknown) => {
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

        /** Processes a single slate block recursively into plain text. */
        const processBlock = (block: unknown): string => {
          if (!isObject(block)) {
            return '';
          }
          let text = '';
          if (block.content) {
            text += extractText(block.content);
          }
          if (Array.isArray(block.children)) {
            const childrenArray: unknown[] = block.children;
            const childrenText = childrenArray
              .map((b: unknown) => processBlock(b))
              .filter(Boolean)
              .join('\n');
            if (childrenText) {
              text += `\n${childrenText}`;
            }
          }
          return text;
        };

        return blocks
          .map((b: unknown) => processBlock(b))
          .filter(Boolean)
          .join('\n');
      }
    } catch {
      // ignore
    }
  }

  return String(description);
};
