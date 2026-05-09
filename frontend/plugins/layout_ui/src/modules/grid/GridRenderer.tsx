import * as React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  DEFAULT_COLS,
  DEFAULT_ROW_HEIGHT,
  LayoutConfig,
  LayoutItem,
} from './types';
import { resolve } from './componentRegistry';

const ResponsiveGridLayout = WidthProvider(Responsive);

const toRglLayout = (items: LayoutItem[]): Layout[] =>
  items.map(({ i, x, y, w, h, static: isStatic }) => ({
    i,
    x,
    y,
    w,
    h,
    static: isStatic,
  }));

export type GridRendererProps = {
  config: LayoutConfig;
  className?: string;
  isDraggable?: boolean;
  isResizable?: boolean;
  onLayoutChange?: (next: Layout[]) => void;
};

export const GridRenderer: React.FC<GridRendererProps> = ({
  config,
  className,
  isDraggable = false,
  isResizable = false,
  onLayoutChange,
}) => {
  const cols = config.cols ?? DEFAULT_COLS;
  const rowHeight = config.rowHeight ?? DEFAULT_ROW_HEIGHT;

  return (
    <ResponsiveGridLayout
      className={className}
      layouts={{ lg: toRglLayout(config.items) }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: cols, md: cols, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={rowHeight}
      isDraggable={isDraggable}
      isResizable={isResizable}
      margin={[12, 12]}
      onLayoutChange={onLayoutChange}
    >
      {config.items.map((item) => {
        const Component = resolve(item.component);
        return (
          <div
            key={item.i}
            className="bg-background rounded-md overflow-hidden"
          >
            <Component {...(item.props ?? {})} />
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
};
