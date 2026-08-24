export const formatDate = (value: string | null): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

/** Announcements without a slug fall back to their id for routing. */
export const announcementHref = (post: { _id: string; slug: string | null }) =>
  `/announcements/${encodeURIComponent(post.slug ?? post._id)}`;
