import { z } from 'zod';

// Any block from any schema: only file blocks and galleries carry attachments.
type BlockLike = { type: string; props?: unknown };

export type BlockAttachment = {
  url: string;
  name: string;
  type: string;
  size: number;
};

const FILE_BLOCK_EXTENSIONS: Record<string, string> = {
  image: 'png',
  video: 'mp4',
  audio: 'mp3',
  file: 'bin',
};

const MIME_PREFIXES: Record<string, string> = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  file: 'application',
};

const fileBlockProps = z.object({ url: z.string().min(1), name: z.string().optional() });

const galleryBlockProps = z.object({ images: z.string().min(1) });

const galleryImages = z.array(z.object({ url: z.string(), caption: z.string().optional() }));

function mimeFromBlock(blockType: string, name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const prefix = MIME_PREFIXES[blockType] ?? 'application';

  if (blockType === 'file') {
    return ext ? `application/${ext}` : 'application/octet-stream';
  }

  return ext ? `${prefix}/${ext}` : `${prefix}/*`;
}

const parseGalleryImages = (images: string) => {
  try {
    const parsed = galleryImages.safeParse(JSON.parse(images));

    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
};

export const getBlockAttachments = (blocks: BlockLike[]): BlockAttachment[] =>
  blocks.flatMap((block) => {
    const extension = FILE_BLOCK_EXTENSIONS[block.type];
    const fileProps = fileBlockProps.safeParse(block.props);

    if (extension && fileProps.success) {
      const name = fileProps.data.name || `${block.type}.${extension}`;

      return [{ url: fileProps.data.url, name, type: mimeFromBlock(block.type, name), size: 0 }];
    }

    const galleryProps = galleryBlockProps.safeParse(block.props);

    if (block.type !== 'gallery' || !galleryProps.success) return [];

    return parseGalleryImages(galleryProps.data.images)
      .filter((img) => img.url)
      .map((img) => {
        const fileName = img.url.split('/').pop() ?? '';

        return {
          url: img.url,
          name: fileName || 'image.png',
          type: mimeFromBlock('image', fileName),
          size: 0,
        };
      });
  });
