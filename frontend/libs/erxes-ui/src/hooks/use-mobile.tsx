import { useMediaQuery } from 'erxes-ui/hooks/use-media-query';

const MOBILE_BREAKPOINT = 1024;

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
