const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  const extractTextFromBlocks = (blocks: any[]): string => {
    const texts: string[] = [];
  
    const walk = (node: any) => {
      if (!node) return;
      if (typeof node === 'string') return;
  
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
  
      if (typeof node === 'object') {
        if (typeof node.text === 'string') texts.push(node.text);
        if (Array.isArray(node.content)) node.content.forEach(walk);
        if (Array.isArray(node.children)) node.children.forEach(walk);
      }
    };
  
    walk(blocks);
  
    return texts.join(' ').replace(/\s+/g, ' ').trim();
  };
  
  export const toPlainText = (value: any): string => {
    if (value === null || value === undefined) return '';
  
    if (typeof value === 'string') {
      const s = value.trim();
      if (!s) return '';

      if (s.includes('<') && s.includes('>')) {
        return stripHtml(s);
      }

      if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return extractTextFromBlocks(parsed);
          // sometimes it's { blocks: [...] }
          if (parsed?.blocks && Array.isArray(parsed.blocks)) {
            return extractTextFromBlocks(parsed.blocks);
          }
        } catch {
            // ignore invalid JSON; fall through to return the trimmed string
        }
      }
  
      return s;
    }
  
    if (Array.isArray(value)) {
      return extractTextFromBlocks(value);
    }
  
    if (typeof value === 'object') {
      if (Array.isArray((value as any).blocks)) {
        return extractTextFromBlocks((value as any).blocks);
      }
      return JSON.stringify(value);
    }
  
    return String(value);
  };
  