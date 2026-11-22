import { createComponentImplementation } from '@erxes/assistant-catalog/react';
import {
  CardApi,
  ColumnApi,
  DividerApi,
  ListApi,
  RowApi,
  TabsApi,
  TextApi,
} from '@erxes/assistant-catalog';
import { Card, cn, Separator, Tabs } from 'erxes-ui';
import { Markdown } from '../../Markdown';
import { Children, Weighted, weighted } from './children';
import { textOf } from './values';

const JUSTIFY = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  spaceBetween: 'justify-between',
  spaceAround: 'justify-around',
  spaceEvenly: 'justify-evenly',
  stretch: 'justify-stretch',
} as const;

const ALIGN = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const;

export const Text = createComponentImplementation(TextApi, ({ props }) => (
  <div
    style={{ '--weight': props.weight }}
    className={cn(
      'min-w-0',
      weighted(props.weight),
      props.variant === 'caption' && 'text-xs text-muted-foreground',
    )}
  >
    <Markdown text={textOf(props.text)} streaming={false} />
  </div>
));

export const Row = createComponentImplementation(RowApi, ({ props, buildChild }) => (
  <div
    style={{ '--weight': props.weight }}
    className={cn(
      'flex min-w-0 flex-wrap gap-2',
      weighted(props.weight),
      JUSTIFY[props.justify ?? 'start'],
      ALIGN[props.align ?? 'stretch'],
    )}
  >
    <Children refs={props.children} build={buildChild} />
  </div>
));

export const Column = createComponentImplementation(ColumnApi, ({ props, buildChild }) => (
  <div
    style={{ '--weight': props.weight }}
    className={cn(
      'flex min-w-0 flex-col gap-3',
      weighted(props.weight),
      JUSTIFY[props.justify ?? 'start'],
      ALIGN[props.align ?? 'stretch'],
    )}
  >
    <Children refs={props.children} build={buildChild} />
  </div>
));

export const List = createComponentImplementation(ListApi, ({ props, buildChild }) => (
  <div
    style={{ '--weight': props.weight }}
    className={cn(
      'flex min-w-0 gap-2',
      weighted(props.weight),
      props.direction === 'horizontal' ? 'flex-row overflow-x-auto' : 'flex-col',
      ALIGN[props.align ?? 'stretch'],
    )}
  >
    <Children refs={props.children} build={buildChild} />
  </div>
));

export const SurfaceCard = createComponentImplementation(CardApi, ({ props, buildChild }) => (
  <Weighted weight={props.weight}>
    <Card className="min-w-0">
      <div className="p-3">{buildChild(props.child)}</div>
    </Card>
  </Weighted>
));

export const SurfaceTabs = createComponentImplementation(TabsApi, ({ props, buildChild }) => {
  const [first] = props.tabs;

  return (
    <Weighted weight={props.weight}>
      <Tabs defaultValue={first?.child} className="min-w-0">
        <Tabs.List>
          {props.tabs.map((tab) => (
            <Tabs.Trigger key={tab.child} value={tab.child}>
              {tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {props.tabs.map((tab) => (
          <Tabs.Content key={tab.child} value={tab.child}>
            <div className="pt-3">{buildChild(tab.child)}</div>
          </Tabs.Content>
        ))}
      </Tabs>
    </Weighted>
  );
});

export const Divider = createComponentImplementation(DividerApi, ({ props }) => (
  <Separator orientation={props.axis === 'vertical' ? 'vertical' : 'horizontal'} />
));
