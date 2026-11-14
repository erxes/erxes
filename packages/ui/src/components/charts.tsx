import React from 'react';
import * as RechartsPrimitive from 'recharts';
import type { LegendPayload } from 'recharts/types/component/DefaultLegendContent';
import type { Payload } from 'recharts/types/component/DefaultTooltipContent';
import { cn } from '../lib/utils';
import {
  ChartContext,
  configFor,
  fillOf,
  keyOf,
  THEMES,
  useChart,
  type ChartConfig,
} from './chart-config';

/** The series colours as `--color-<key>` variables, per theme. */
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colored = Object.entries(config).filter(([, item]) => item.theme ?? item.color);

  if (colored.length === 0) return null;

  const css = (['light', 'dark'] as const)
    .map((theme) => {
      const variables = colored.flatMap(([key, item]) => {
        const color = item.theme?.[theme] ?? item.color;

        return color ? [`  --color-${key}: ${color};`] : [];
      });

      return `${THEMES[theme]} [data-chart=${id}] {\n${variables.join('\n')}\n}`;
    })
    .join('\n');

  return <style>{css}</style>;
};

const ChartContainer = ({
  ref,
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
}) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
};

type TooltipItem = Payload;

type ChartTooltipContentProps = React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<'div'> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
    // recharts 3 passes these to custom content; its props type no longer lists them
    payload?: TooltipItem[];
    label?: React.ReactNode;
  };

const TooltipLabel = ({
  payload,
  label,
  labelKey,
  labelFormatter,
  labelClassName,
}: Pick<ChartTooltipContentProps, 'label' | 'labelKey' | 'labelFormatter' | 'labelClassName'> & {
  payload: TooltipItem[];
}) => {
  const { config } = useChart();
  const [item] = payload;
  const itemConfig = configFor(config, item, keyOf(labelKey, item?.dataKey, item?.name));

  const value =
    !labelKey && typeof label === 'string' ? (config[label]?.label ?? label) : itemConfig?.label;

  if (!labelFormatter && !value) return null;

  return (
    <div className={cn('font-medium', labelClassName)}>
      {labelFormatter ? labelFormatter(value, payload) : value}
    </div>
  );
};

const TooltipIndicator = ({
  indicator,
  color,
  nested,
}: {
  indicator: 'line' | 'dot' | 'dashed';
  color?: string;
  nested: boolean;
}) => (
  <div
    className={cn('shrink-0 rounded-xs border-border', {
      'h-2.5 w-2.5': indicator === 'dot',
      'w-1': indicator === 'line',
      'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
      'my-0.5': nested && indicator === 'dashed',
    })}
    style={{ backgroundColor: indicator === 'dashed' ? undefined : color }}
  />
);

const TooltipRow = ({
  item,
  index,
  payload,
  props,
  label,
}: {
  item: TooltipItem;
  index: number;
  payload: TooltipItem[];
  props: ChartTooltipContentProps;
  label: React.ReactNode;
}) => {
  const { config } = useChart();
  const { indicator = 'dot', formatter } = props;
  const nested = label !== null;
  const itemConfig = configFor(config, item, keyOf(props.nameKey, item.name, item.dataKey));

  if (formatter && item.value !== undefined && item.name) {
    return formatter(item.value, item.name, item, index, payload);
  }

  return (
    <>
      {itemConfig?.icon ? (
        <itemConfig.icon />
      ) : (
        !props.hideIndicator && (
          <TooltipIndicator
            indicator={indicator}
            color={props.color ?? fillOf(item) ?? item.color}
            nested={nested}
          />
        )
      )}
      <div
        className={cn(
          'flex flex-1 justify-between leading-none',
          nested ? 'items-end' : 'items-center',
        )}
      >
        <div className="grid gap-1.5">
          {label}
          <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
        </div>
        {item.value !== undefined && (
          <span className="font-mono font-medium tabular-nums text-foreground">
            {item.value.toLocaleString()}
          </span>
        )}
      </div>
    </>
  );
};

const ChartTooltipContent = ({
  ref,
  ...props
}: ChartTooltipContentProps & React.RefAttributes<HTMLDivElement>) => {
  const { active, payload, className, indicator = 'dot', hideLabel = false } = props;

  if (!active || !payload?.length) return null;

  const nestLabel = payload.length === 1 && indicator !== 'dot';
  const label = hideLabel ? null : <TooltipLabel {...props} payload={payload} />;

  return (
    <div
      ref={ref}
      className={cn(
        'grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
        className,
      )}
    >
      {nestLabel ? null : label}
      <div className="grid gap-1.5">
        {payload.map((item, index) => (
          <div
            key={keyOf(props.nameKey, item.name, item.dataKey)}
            className={cn(
              'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
              indicator === 'dot' && 'items-center',
            )}
          >
            <TooltipRow
              item={item}
              index={index}
              payload={payload}
              props={props}
              label={nestLabel ? label : null}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartLegendContent = ({
  ref,
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: React.ComponentProps<'div'> & {
  // Recharts passes its Legend props to the content element.
  verticalAlign?: 'top' | 'middle' | 'bottom';
  payload?: readonly LegendPayload[];
  hideIcon?: boolean;
  nameKey?: string;
}) => {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload.map((item) => {
        const itemConfig = configFor(config, item, keyOf(nameKey, item.dataKey));

        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-xs"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
};

export { ChartContainer, ChartTooltipContent, ChartLegendContent };
