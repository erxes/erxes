import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { orpc } from '@erxes/core-contract/client';
import { assistantPickedModelState } from './assistantState';
import { modelToRun } from './modelChoice';

const CATALOG_STALE_MS = 5 * 60_000;

const NO_DEFAULT = { defaultProvider: null, defaultModel: null };

export const useModelRun = () => {
  const [picked, setPicked] = useAtom(assistantPickedModelState);
  const connected = useQuery(orpc.assistant.providers.queryOptions());
  const settings = useQuery(orpc.assistant.settings.queryOptions());

  const catalog = useQuery({
    ...orpc.assistant.models.queryOptions(),
    enabled: Boolean(connected.data?.data.length),
    staleTime: CATALOG_STALE_MS,
  });

  const providers = (connected.data?.data ?? []).map(({ provider }) => provider);
  const entries = catalog.data?.data ?? [];

  return {
    run: modelToRun({
      providers,
      preferred: settings.data ?? NO_DEFAULT,
      catalog: entries,
      picked,
    }),
    picked,
    setPicked,
    entries,
    noKey: connected.isSuccess && providers.length === 0,
  };
};

export type ModelRunState = ReturnType<typeof useModelRun>;
