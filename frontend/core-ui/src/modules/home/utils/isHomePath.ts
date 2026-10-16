import { AppPath } from '@/types/paths/AppPath';

/** Home covers its own pages and My Inbox, which share the Home sidebar. */
export const isHomePath = (pathname: string) =>
  pathname.startsWith(`/${AppPath.Home}`) ||
  pathname.startsWith(`/${AppPath.MyInbox}`);
