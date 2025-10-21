import { useEffect, useMemo, useRef } from 'react';
import { Edge } from '@xyflow/react';
import { generateEdges } from '@/automations/utils/automationBuilderUtils/generateEdges';

interface UseReactFlowEdgesParams {
  triggers: any[];
  actions: any[];
  workflows: any[];
  actionFolks: Record<string, any[]>;
  setEdges: (edges: Edge[]) => void;
}

export function useReactFlowEdges({
  triggers,
  actions,
  workflows,
  actionFolks,
  setEdges,
}: UseReactFlowEdgesParams) {
  const rafRef = useRef<number>();
  const prevKeyRef = useRef<string>('');

  const computedEdges = useMemo(() => {
    return generateEdges(triggers, actions, workflows, actionFolks);
  }, [triggers, actions, workflows, actionFolks]);

  useEffect(() => {
    const key = JSON.stringify(
      computedEdges.map((e) => ({
        id: e.id,
        s: e.source,
        t: e.target,
        sh: (e as any).sourceHandle,
        th: (e as any).targetHandle,
        tp: e.type,
      })),
    );

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (key !== prevKeyRef.current) {
        prevKeyRef.current = key;
        setEdges(computedEdges);
      }
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [computedEdges, setEdges]);
}
