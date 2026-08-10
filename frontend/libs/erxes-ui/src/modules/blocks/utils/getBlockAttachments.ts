type BlockLike = { type: string; props?: Record<string, any> };

export type BlockAttachment = {
  url: string;
  name: string;
  type: string;
  size: number;
};

const MIME_PREFIXES: Record<string, string> = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  file: 'application',
};

function mimeFromBlock(blockType: string, name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const prefix = MIME_PREFIXES[blockType] ?? 'application';

  if (blockType === 'file') {
    return ext ? `application/${ext}` : 'application/octet-stream';
  }

  return ext ? `${prefix}/${ext}` : `${prefix}/*`;
}


export const getBlockAttachments = (blocks: BlockLike[]): BlockAttachment[] =>
  blocks.flatMap((block) => {
    const props = block.props ?? {};

    if (
      ['image', 'video', 'audio', 'file'].includes(block.type) &&
      props.url
    ) {
      const name =
        props.name || `${block.type}.${block.type === 'audio' ? 'mp3' : block.type === 'video' ? 'mp4' : block.type === 'image' ? 'png' : 'bin'}`;
      return [
        {
          url: props.url as string,
          name,
          type: mimeFromBlock(block.type, name),
          size: 0,
        },
      ];
    }

    if (block.type === 'gallery' && props.images) {
      try {
        const imgs: { url: string; caption?: string }[] = JSON.parse(
          props.images,
        );
        return imgs
          .filter((img) => img.url)
          .map((img) => ({
            url: img.url,
            name: img.url.split('/').pop() || 'image.png',
            type: mimeFromBlock('image', img.url.split('/').pop() || ''),
            size: 0,
          }));
      } catch {
        return [];
      }
    }

    return [];
  });
