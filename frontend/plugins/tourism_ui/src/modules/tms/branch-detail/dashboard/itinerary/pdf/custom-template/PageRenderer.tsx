import React, { useMemo } from 'react';
import { ElementRenderer } from './ElementRenderer';
import type { PdfPageDefinition, PdfTemplateElement } from './template.types';

interface PageRendererProps {
  page: PdfPageDefinition;
  elements: PdfTemplateElement[];
  zoom: number;
  selectedIds: string[];
  onSelectElement: (elementId: string) => void;
  onMoveElement: (
    elementId: string,
    position: { x: number; y: number },
  ) => void;
}

export const PageRenderer: React.FC<PageRendererProps> = React.memo(
  function PageRenderer({
    page,
    elements,
    zoom,
    selectedIds,
    onSelectElement,
    onMoveElement,
  }) {
    const orderedElements = useMemo(
      () =>
        elements
          .filter((element) => element.visible && element.pageId === page.id)
          .sort((left, right) => left.zIndex - right.zIndex),
      [elements, page.id],
    );

    return (
      <div
        className="relative overflow-hidden rounded-2xl border bg-white shadow-sm"
        style={{
          width: page.size.width * zoom,
          height: page.size.height * zoom,
          transformOrigin: 'top left',
          background: page.background.fill,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: page.grid.enabled
              ? `linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px),
                 linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)`
              : undefined,
            backgroundSize: `${page.grid.size * zoom}px ${
              page.grid.size * zoom
            }px`,
          }}
        />

        <div
          className="absolute"
          style={{
            inset: 0,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          {orderedElements.map((element) => (
            <ElementRenderer
              key={element.id}
              element={element}
              selected={selectedIds.includes(element.id)}
              zoom={zoom}
              onSelect={onSelectElement}
              onMove={onMoveElement}
            />
          ))}
        </div>
      </div>
    );
  },
);
