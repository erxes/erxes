import React from 'react';
import { PageRenderer } from './PageRenderer';
import { usePdfEditorStore } from './usePdfEditorStore';

export const PdfEditorCanvas: React.FC = React.memo(function PdfEditorCanvas() {
  const { template, selection, viewport, selectElement, updateElementFrame } =
    usePdfEditorStore();

  return (
    <div className="flex-1 overflow-auto bg-muted/30 px-8 py-6">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        {template.pages
          .sort((left, right) => left.order - right.order)
          .map((page) => (
            <PageRenderer
              key={page.id}
              page={page}
              elements={template.elements}
              zoom={viewport.zoom}
              selectedIds={selection}
              onSelectElement={(elementId) => selectElement([elementId])}
              onMoveElement={(elementId, position) =>
                updateElementFrame({
                  elementId,
                  frame: position,
                })
              }
            />
          ))}
      </div>
    </div>
  );
});
