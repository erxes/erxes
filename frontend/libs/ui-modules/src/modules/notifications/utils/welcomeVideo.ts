const YOUTUBE_URL_RE =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([\w-]{6,})/;

export const getYoutubeEmbedSrc = (src: string) => {
  const match = YOUTUBE_URL_RE.exec(src);

  return match
    ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&playsinline=1&loop=1&playlist=${match[1]}&controls=0&disablekb=1&fs=0&rel=0&modestbranding=1&iv_load_policy=3`
    : null;
};
