import {
  blockText,
  parseBlocks,
  trimTrailingEmpty,
} from '@/modules/ui/lib/blocks';

export const CONTACT_MARKER = '— Холбоо барих: ';

export const splitTicketBody = (
  description: string | null,
): { message: string; contact: string | null } => {
  const text = description?.trim() ?? '';
  const blocks = parseBlocks(text);

  if (blocks) {
    const at = blocks.findIndex((block) =>
      blockText(block).trim().startsWith(CONTACT_MARKER),
    );

    if (at === -1) {
      return { message: text, contact: null };
    }

    const contact = blockText(blocks[at])
      .trim()
      .slice(CONTACT_MARKER.length)
      .trim();

    const rest = trimTrailingEmpty(blocks.filter((_, index) => index !== at));

    return { message: JSON.stringify(rest), contact: contact || null };
  }

  const at = text.lastIndexOf(CONTACT_MARKER);

  if (at === -1) {
    return { message: text, contact: null };
  }

  return {
    message: text.slice(0, at).trim(),
    contact: text.slice(at + CONTACT_MARKER.length).trim() || null,
  };
};

export const formatDateTime = (value: string | null): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};
