const MB = 1024 * 1024;

/**
 * WhatsApp Cloud API media limits, by the media type the backend sends a file
 * as (see `getOutgoingMediaType` in frontline_api): JPEG/PNG images 5 MB,
 * MP4/3GPP video and AAC/AMR/MP3/MP4/OGG audio 16 MB, everything else is a
 * document up to 100 MB.
 */
export const getWhatsappAttachmentMaximumBytes = (mimeType: string): number => {
  const type = mimeType.toLowerCase();

  if (/^image\/(jpeg|png)$/.test(type)) return 5 * MB;
  if (/^video\/(mp4|3gpp)$/.test(type)) return 16 * MB;
  if (/^audio\/(aac|amr|mpeg|mp4|ogg)$/.test(type)) return 16 * MB;

  return 100 * MB;
};
