import { IMastraChatAttachment } from '@/session/@types/session';
import { fetchAttachmentBuffer } from './storage';
import { isImageType } from './extract';

// ---------------------------------------------------------------------------
// Turns a user message + its attachments into what the model actually sees:
//   - a text block with an "Attached files" manifest (names, sizes, keys),
//   - inlined multimodal image parts for image attachments.
// Documents are NOT inlined — the agent reads them on demand through the
// read-attachment tool, so a 200-page PDF doesn't blow the context window.
// ---------------------------------------------------------------------------

const MAX_INLINE_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Human-readable file size ("3.4 KB"), empty string for unknown sizes. */
export function formatBytes(size?: number): string {
  if (!size || size <= 0) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

// The manifest appended to the user's text so the model knows what was
// attached and how to open it.
export function buildAttachmentManifest(
  attachments: IMastraChatAttachment[],
): string {
  const lines = attachments.map((a, i) => {
    const size = formatBytes(a.size);
    const kind = a.type || 'unknown type';
    return `${i + 1}. "${a.name}" (${kind}${size ? `, ${size}` : ''}) — key: "${a.url}"`;
  });

  const hasDocs = attachments.some((a) => !isImageType(a.name, a.type));
  const hasImages = attachments.some((a) => isImageType(a.name, a.type));

  const guidance: string[] = [];
  if (hasDocs) {
    guidance.push(
      "To read a document's contents, call the read-attachment tool with the exact key shown above.",
    );
  }
  if (hasImages) {
    guidance.push(
      'Images are included in this message and already visible to you — never call read-attachment for an image.',
    );
  }

  return ['--- Attached files ---', ...lines, ...guidance].join('\n');
}

// A compact note appended when REPLAYING history, so the agent can still
// re-open files attached in earlier turns.
export function historyAttachmentNote(
  attachments: IMastraChatAttachment[],
): string {
  const list = attachments
    .map((a) => `"${a.name}" (key: "${a.url}")`)
    .join(', ');
  return `[Attached files in this message: ${list} — readable via the read-attachment tool]`;
}

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; image: string; mimeType?: string; mediaType?: string };

/**
 * Build the user-turn content for the LLM. Returns a plain string when there
 * are no usable images, or an AI-SDK content-part array with the images
 * inlined as data URLs. Image fetch failures are non-fatal — the file stays
 * listed in the manifest, the turn proceeds.
 */
export async function buildChatUserContent(params: {
  message: string;
  attachments?: IMastraChatAttachment[];
  erxesApiUrl: string;
}): Promise<string | ContentPart[]> {
  const { message, attachments, erxesApiUrl } = params;
  if (!attachments?.length) return message;

  const text = `${message}\n\n${buildAttachmentManifest(attachments)}`;

  const images = attachments
    .filter((a) => isImageType(a.name, a.type))
    .slice(0, MAX_INLINE_IMAGES);
  if (!images.length) return text;

  const parts: ContentPart[] = [{ type: 'text', text }];

  for (const img of images) {
    try {
      const { buffer, contentType } = await fetchAttachmentBuffer({
        erxesApiUrl,
        keyOrUrl: img.url,
        name: img.name,
      });
      if (buffer.length > MAX_IMAGE_BYTES) continue;

      const mime = img.type?.startsWith('image/')
        ? img.type
        : contentType.startsWith('image/')
          ? contentType
          : 'image/png';

      parts.push({
        type: 'image',
        image: `data:${mime};base64,${buffer.toString('base64')}`,
        // AI SDK v4 reads mimeType, v5 reads mediaType — set both.
        mimeType: mime,
        mediaType: mime,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        `[erxes-agent] could not inline image "${img.name}": ${message}`,
      );
    }
  }

  // Every image fetch failed — fall back to the plain manifest text.
  return parts.length > 1 ? parts : text;
}
