export type VideoEmbedProvider = 'youtube' | 'vimeo';

export type VideoEmbedInfo = {
  provider: VideoEmbedProvider;
  embedUrl: string;
  thumbnailUrl?: string;
};

const YOUTUBE_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-z0-9_-]{11})(?=$|[?&#/])/i;

const VIMEO_PATTERN =
  /^(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d+)(?=$|[?&#/])/i;

/** Parses a YouTube or Vimeo URL into an embeddable iframe URL (and thumbnail, when derivable without a network call). */
export const parseVideoEmbedUrl = (url: string): VideoEmbedInfo | null => {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const youtubeMatch = YOUTUBE_PATTERN.exec(trimmed);
  if (youtubeMatch) {
    const id = youtubeMatch[1];
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }

  const vimeoMatch = VIMEO_PATTERN.exec(trimmed);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return {
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${id}`,
    };
  }

  return null;
};
