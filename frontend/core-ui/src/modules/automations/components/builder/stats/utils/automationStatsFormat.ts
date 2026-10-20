export const formatStatsDuration = (ms?: number) => {
  if (ms === undefined || ms === null) {
    return '—';
  }

  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
};
