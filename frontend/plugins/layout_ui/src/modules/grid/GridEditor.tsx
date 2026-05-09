import * as React from 'react';
import type { Layout } from 'react-grid-layout';
import { GridRenderer } from './GridRenderer';
import { LayoutConfig } from './types';

export type GridEditorProps = {
  config: LayoutConfig;
  onChange?: (next: LayoutConfig) => void;
  className?: string;
};

const mergeLayout = (
  config: LayoutConfig,
  rglLayout: Layout[],
): LayoutConfig => {
  const positionMap = new Map(rglLayout.map((l) => [l.i, l]));
  return {
    ...config,
    items: config.items.map((item) => {
      const next = positionMap.get(item.i);
      if (!next) return item;
      return { ...item, x: next.x, y: next.y, w: next.w, h: next.h };
    }),
  };
};

export const GridEditor: React.FC<GridEditorProps> = ({
  config,
  onChange,
  className,
}) => {
  const [current, setCurrent] = React.useState<LayoutConfig>(config);

  React.useEffect(() => {
    setCurrent(config);
  }, [config]);

  const handleLayoutChange = (rglLayout: Layout[]) => {
    const next = mergeLayout(current, rglLayout);
    setCurrent(next);
    onChange?.(next);
  };

  return (
    <GridRenderer
      config={current}
      className={className}
      isDraggable
      isResizable
      onLayoutChange={handleLayoutChange}
    />
  );
};
