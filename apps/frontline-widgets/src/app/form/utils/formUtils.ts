import { ICallout } from '../types/formTypes';

/**
 * A callout is only worth its own screen when it is not skipped and carries
 * something to show. Otherwise the widget starts straight at the first step.
 */
export const isCalloutVisible = (callout?: ICallout | null): boolean =>
  !!callout &&
  !callout.skip &&
  !!(callout.title || callout.body || callout.featuredImage);
