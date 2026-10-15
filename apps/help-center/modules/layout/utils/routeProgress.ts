export const ROUTE_PROGRESS_START = 'route-progress:start';

export const startRouteProgress = (href: string): void => {
  const url = new URL(href, window.location.href);

  if (url.origin !== window.location.origin) {
    return;
  }

  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return;
  }

  window.dispatchEvent(new Event(ROUTE_PROGRESS_START));
};
