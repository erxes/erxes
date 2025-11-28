import { useState } from 'react';
import { MiniMap, PanelPosition } from '@xyflow/react';
import { IconMap, IconX } from '@tabler/icons-react';
import { MiniMapToggleProps } from '../types';

export default function MiniMapToggle({
  nodeStrokeWidth = 3,
  zoomable = true,
  pannable = true,
  position = 'top-left',
}: MiniMapToggleProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <div className="absolute top-2 left-2 z-10">
        <button
          onClick={() => setIsVisible(true)}
          className="p-2 rounded-full shadow-sm transition-colors bg-background"
          aria-label="Show minimap"
        >
          <IconMap className="w-4 h-4 text-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <MiniMap
        nodeStrokeWidth={nodeStrokeWidth}
        zoomable={zoomable}
        pannable={pannable}
        position={position as PanelPosition}
        style={{
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '0.375rem',
        }}
      />

      <div className="absolute top-2 left-2 z-10">
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-full shadow-sm transition-colors bg-background"
          aria-label="Close minimap"
        >
          <IconX className="w-3 h-3 text-foreground" />
        </button>
      </div>
    </div>
  );
}
