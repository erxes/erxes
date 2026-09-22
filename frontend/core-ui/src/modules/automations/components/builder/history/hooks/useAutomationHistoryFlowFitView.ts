import { HISTORY_FLOW_FIT_VIEW_OPTIONS } from '@/automations/constants';
import { useReactFlow } from '@xyflow/react';
import { RefObject, useCallback, useEffect, useRef } from 'react';

export const useAutomationHistoryFlowFitView = (
  containerRef: RefObject<HTMLDivElement>,
  nodeCount: number,
) => {
  const { fitView } = useReactFlow();
  const hasUserMovedRef = useRef(false);

  useEffect(() => {
    hasUserMovedRef.current = false;
  }, [nodeCount]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let frame = 0;
    const refit = () => {
      if (hasUserMovedRef.current) {
        return;
      }

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        fitView(HISTORY_FLOW_FIT_VIEW_OPTIONS),
      );
    };

    const observer = new ResizeObserver(refit);

    observer.observe(container);
    refit();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [containerRef, fitView, nodeCount]);

  const onMoveStart = useCallback((event: MouseEvent | TouchEvent | null) => {
    if (event) {
      hasUserMovedRef.current = true;
    }
  }, []);

  return { onMoveStart };
};
