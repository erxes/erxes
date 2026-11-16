import { Spinner } from 'erxes-ui';
import { type ComponentType, lazy, Suspense } from 'react';

/**
 * A record view the side panel loads the first time one opens. The panel is in every page's
 * shell, and records' views bring their tabs, forms and timelines with them.
 */
export const lazyPanelView = <P extends object>(load: () => Promise<ComponentType<P>>) => {
  const View = lazy(async () => ({ default: await load() }));

  const LazyPanelView = (props: P) => (
    <Suspense fallback={<Spinner area="lg" />}>
      <View {...props} />
    </Suspense>
  );

  return LazyPanelView;
};
