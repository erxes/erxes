import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { orpc } from '@erxes/core-contract/client';
import { assistantPickedModelState } from './assistantState';
import { modelToRun } from './modelChoice';

const CATALOG_STALE_MS = 5 * 60_000;

export const useModelRun = () => {
  const [picked, setPicked] = useAtom(assistantPickedModelState);
  const connections = useQuery(orpc.assistant.connections.queryOptions());

  const catalog = useQuery({
    ...orpc.assistant.models.queryOptions(),
    enabled: Boolean(connections.data?.data.length),
    staleTime: CATALOG_STALE_MS,
  });

  const saved = connections.data?.data ?? [];
  const entries = catalog.data?.data ?? [];

  return {
    run: modelToRun({ connections: saved, catalog: entries, picked }),
    picked,
    setPicked,
    connections,
    catalog,
    entries,
    noKey: connections.isSuccess && saved.length === 0,
  };
};

export type ModelRunState = ReturnType<typeof useModelRun>;
