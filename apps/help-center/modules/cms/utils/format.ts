export { dateParts, formatDate } from '@/modules/i18n/format';

export const announcementHref = (post: { _id: string; slug: string | null }) =>
  `/announcements/${encodeURIComponent(post.slug ?? post._id)}`;
