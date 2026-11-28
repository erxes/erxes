import { ChartApi } from '@erxes/assistant-catalog';
import { createComponentImplementation } from '@erxes/assistant-catalog/react';
import { Skeleton } from 'erxes-ui';
import { lazy, Suspense } from 'react';

const ChartPlot = lazy(async () => {
  const [charts, { chartPlotWith }] = await Promise.all([
    import('recharts'),
    import('./ChartPlot'),
  ]);

  return { default: chartPlotWith(charts) };
});

export const Chart = createComponentImplementation(ChartApi, ({ props }) => (
  <figure className="flex min-w-0 flex-col gap-2">
    {props.title && <figcaption className="text-xs font-medium">{props.title}</figcaption>}
    <Suspense fallback={<Skeleton className="h-52 w-full" />}>
      <ChartPlot kind={props.kind} labels={props.labels} series={props.series} />
    </Suspense>
  </figure>
));
