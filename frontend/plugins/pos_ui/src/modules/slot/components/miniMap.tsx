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
          className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Show minimap"
        >
          <IconMap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
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
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #e2e8f0',
          borderRadius: '0.375rem',
        }}
      />

      <div className="absolute top-2 left-2 z-10">
        <button
          onClick={() => setIsVisible(false)}
          className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close minimap"
        >
          <IconX className="h-3 w-3 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}
