import { useCallback, useEffect, useRef } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAtom } from 'jotai';
import { slotDetailAtom } from '../states/slot';
import { TableNodeData } from '../types';

function isTableNodeData(data: any): data is TableNodeData {
  return typeof data.label === 'string';
}

export function TableNode({ id, data, selected }: NodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [, setSlotDetail] = useAtom(slotDetailAtom);

  const nodeData: TableNodeData = isTableNodeData(data)
    ? data
    : {
        label: '',
        color: '#5E5CFF',
        width: 80,
        height: 80,
        rounded: false,
        rotateAngle: 0,
        zIndex: 0,
        disabled: false,
        code: '',
        positionX: 0,
        positionY: 0,
      };

  const resizeRefs = {
    topLeft: useRef<HTMLDivElement>(null),
    top: useRef<HTMLDivElement>(null),
    topRight: useRef<HTMLDivElement>(null),
    right: useRef<HTMLDivElement>(null),
    bottomRight: useRef<HTMLDivElement>(null),
    bottom: useRef<HTMLDivElement>(null),
    bottomLeft: useRef<HTMLDivElement>(null),
    left: useRef<HTMLDivElement>(null),
  };

  const setupResize = useCallback(
    (direction: string) => {
      if (!nodeRef.current) {
        return;
      }
      const nodeElement = nodeRef.current;
      const resizeHandle =
        resizeRefs[direction as keyof typeof resizeRefs]?.current;

      if (!resizeHandle) {
        return;
      }

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const startWidth = nodeElement.offsetWidth;
        const startHeight = nodeElement.offsetHeight;
        const startX = e.clientX;
        const startY = e.clientY;

        let deltaX = 0;
        let deltaY = 0;

        const onMouseMove = (moveEvent: MouseEvent) => {
          moveEvent.preventDefault();
          moveEvent.stopPropagation();

          let newWidth = startWidth;
          let newHeight = startHeight;

          if (direction.includes('right')) {
            newWidth = Math.max(60, startWidth + (moveEvent.clientX - startX));
          }
          if (direction.includes('left')) {
            newWidth = Math.max(60, startWidth - (moveEvent.clientX - startX));
            if (newWidth !== startWidth) {
              const widthDiff = startWidth - newWidth;
              deltaX = widthDiff;
              nodeElement.style.transform = `translateX(${widthDiff}px) rotate(${
                nodeData.rotateAngle || 0
              }deg)`;
            }
          }
          if (direction.includes('bottom')) {
            newHeight = Math.max(
              40,
              startHeight + (moveEvent.clientY - startY),
            );
          }
          if (direction.includes('top')) {
            newHeight = Math.max(
              40,
              startHeight - (moveEvent.clientY - startY),
            );
            if (newHeight !== startHeight) {
              const heightDiff = startHeight - newHeight;
              deltaY = heightDiff;
              nodeElement.style.transform = `translateY(${heightDiff}px) rotate(${
                nodeData.rotateAngle || 0
              }deg)`;
            }
          }

          if (direction.includes('left') && direction.includes('top')) {
            nodeElement.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${
              nodeData.rotateAngle || 0
            }deg)`;
          }

          nodeElement.style.width = `${newWidth}px`;
          nodeElement.style.height = `${newHeight}px`;

          if (selected) {
            setSlotDetail((prev) => ({
              ...prev,
              width: String(newWidth),
              height: String(newHeight),
            }));
          }

          const eventDetail: any = {
            id,
            width: newWidth,
            height: newHeight,
          };

          if (deltaX !== 0 || deltaY !== 0) {
            eventDetail.x = (nodeData.positionX ?? 0) + deltaX;
            eventDetail.y = (nodeData.positionY ?? 0) + deltaY;
          }

          const event = new CustomEvent('node:dimensions-change', {
            detail: eventDetail,
          });
          document.dispatchEvent(event);
        };

        const onMouseUp = () => {
          nodeElement.style.transform = `rotate(${
            nodeData.rotateAngle || 0
          }deg)`;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };

      resizeHandle.addEventListener('mousedown', onMouseDown);
      return () => {
        resizeHandle.removeEventListener('mousedown', onMouseDown);
      };
    },
    [
      id,
      nodeData.rotateAngle,
      nodeData.positionX ?? 0,
      nodeData.positionY ?? 0,
      selected,
      setSlotDetail,
    ],
  );

  useEffect(() => {
    if (selected) {
      const cleanups = [
        setupResize('topLeft'),
        setupResize('top'),
        setupResize('topRight'),
        setupResize('right'),
        setupResize('bottomRight'),
        setupResize('bottom'),
        setupResize('bottomLeft'),
        setupResize('left'),
      ];

      return () => {
        cleanups.forEach((cleanup) => cleanup && cleanup());
      };
    }
  }, [selected, setupResize]);

  return (
    <>
      <Handle type="source" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <div
        ref={nodeRef}
        className={`flex items-center justify-center font-medium text-center ${
          selected ? 'ring-2 ring-white ring-opacity-80' : ''
        }`}
        style={{
          backgroundColor: nodeData.color || '#5E5CFF',
          width: nodeData.width || 100,
          height: nodeData.height || 80,
          borderRadius: nodeData.rounded ? '9999px' : '6px',
          transform: `rotate(${nodeData.rotateAngle || 0}deg)`,
          zIndex: nodeData.zIndex || 0,
          color: '#ffffff',
          opacity: nodeData.disabled ? 0.5 : 1,
        }}
      >
        {nodeData.label}
        {selected && (
          <>
            <div
              ref={resizeRefs.bottomRight}
              style={{
                position: 'absolute',
                bottom: '-3px',
                right: '-3px',
                width: '8px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                borderRadius: '50%',
                cursor: 'nwse-resize',
                zIndex: 10,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = 'scale(1.5)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'scale(1)')
              }
            />
            <div
              ref={resizeRefs.bottomLeft}
              style={{
                position: 'absolute',
                bottom: '-3px',
                left: '-3px',
                width: '8px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                borderRadius: '50%',
                cursor: 'nesw-resize',
                zIndex: 10,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = 'scale(1.5)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'scale(1)')
              }
            />
            <div
              ref={resizeRefs.topRight}
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '8px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                borderRadius: '50%',
                cursor: 'nesw-resize',
                zIndex: 10,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = 'scale(1.5)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'scale(1)')
              }
            />
            <div
              ref={resizeRefs.topLeft}
              style={{
                position: 'absolute',
                top: '-3px',
                left: '-3px',
                width: '8px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                borderRadius: '50%',
                cursor: 'nwse-resize',
                zIndex: 10,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = 'scale(1.5)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'scale(1)')
              }
            />
            <div
              ref={resizeRefs.top}
              style={{
                position: 'absolute',
                top: '-3px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                borderRadius: '50%',
                cursor: 'ns-resize',
                zIndex: 10,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform =
                  'translateX(-50%) scale(1.5)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'translateX(-50%)')
              }
            />
            <div
              ref={resizeRefs.bottom}
              style={{
                position: 'absolute',
                bottom: '-3px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                borderRadius: '50%',
                cursor: 'ns-resize',
                zIndex: 10,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform =
                  'translateX(-50%) scale(1.5)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'translateX(-50%)')
              }
            />
            <div
              ref={resizeRefs.left}
              style={{
                position: 'absolute',
                left: '-3px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '8px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                borderRadius: '50%',
                cursor: 'ew-resize',
                zIndex: 10,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform =
                  'translateY(-50%) scale(1.5)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'translateY(-50%)')
              }
            />
            <div
              ref={resizeRefs.right}
              style={{
                position: 'absolute',
                right: '-3px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '8px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                borderRadius: '50%',
                cursor: 'ew-resize',
                zIndex: 10,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform =
                  'translateY(-50%) scale(1.5)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'translateY(-50%)')
              }
            />
          </>
        )}
      </div>
    </>
  );
}
