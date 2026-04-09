import React from 'react';
import type { PdfTemplateElement } from './template.types';

interface ElementRendererProps {
  element: PdfTemplateElement;
  selected: boolean;
  zoom: number;
  onSelect: (elementId: string) => void;
  onMove: (elementId: string, position: { x: number; y: number }) => void;
}

const baseSelectionClass =
  'absolute overflow-hidden rounded-sm border transition-shadow cursor-move';

export const ElementRenderer: React.FC<ElementRendererProps> = React.memo(
  function ElementRenderer({ element, selected, zoom, onSelect, onMove }) {
    const frame = element.frame;
    const selectionClass = selected
      ? 'border-primary shadow-[0_0_0_1px_rgba(220,38,38,0.4)]'
      : 'border-transparent hover:border-border';

    const style: React.CSSProperties = {
      left: frame.x,
      top: frame.y,
      width: frame.width,
      height: frame.height,
      transform: `rotate(${frame.rotation}deg)`,
      opacity: element.opacity,
      background: element.box.backgroundColor,
      borderRadius: element.box.borderRadius,
      zIndex: element.zIndex,
    };

    const handlePointerDown = (
      event: React.PointerEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect(element.id);

      const startPointer = {
        x: event.clientX,
        y: event.clientY,
      };
      const startFrame = {
        x: frame.x,
        y: frame.y,
      };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        onMove(element.id, {
          x: Math.max(
            0,
            startFrame.x + (moveEvent.clientX - startPointer.x) / zoom,
          ),
          y: Math.max(
            0,
            startFrame.y + (moveEvent.clientY - startPointer.y) / zoom,
          ),
        });
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    };

    if (element.type === 'image') {
      return (
        <button
          type="button"
          className={`${baseSelectionClass} ${selectionClass}`}
          style={style}
          onClick={() => onSelect(element.id)}
          onPointerDown={handlePointerDown}
        >
          <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
            {element.props.binding
              ? element.props.binding.path
              : element.props.assetId
              ? 'Image asset'
              : 'Image slot'}
          </div>
        </button>
      );
    }

    if (element.type === 'shape') {
      return (
        <button
          type="button"
          className={`${baseSelectionClass} ${selectionClass}`}
          style={{
            ...style,
            background: element.props.fill,
            border: element.props.stroke
              ? `${element.props.stroke.width}px solid ${element.props.stroke.color}`
              : undefined,
          }}
          onClick={() => onSelect(element.id)}
          onPointerDown={handlePointerDown}
        />
      );
    }

    const content =
      element.type === 'text'
        ? element.props.content
        : element.type === 'dynamic-text'
        ? element.props.placeholder
        : element.type === 'table'
        ? 'Dynamic pricing table'
        : 'Dynamic collection';

    const typography =
      element.type === 'text' || element.type === 'dynamic-text'
        ? element.props.typography
        : undefined;

    return (
      <button
        type="button"
        className={`${baseSelectionClass} ${selectionClass} p-2 text-left`}
        style={style}
        onClick={() => onSelect(element.id)}
        onPointerDown={handlePointerDown}
      >
        <div
          className="h-full w-full overflow-hidden"
          style={{
            fontSize: typography?.fontSize
              ? `${typography.fontSize}px`
              : '11px',
            lineHeight: typography?.lineHeight
              ? String(typography.lineHeight)
              : '1.5',
            color: typography?.color || 'currentColor',
            textAlign: typography?.textAlign || 'left',
            fontWeight: typography?.fontWeight,
            fontStyle: typography?.fontStyle,
          }}
        >
          {content}
        </div>
      </button>
    );
  },
);
