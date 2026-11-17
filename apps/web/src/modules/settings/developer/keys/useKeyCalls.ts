import type { ApiKeyAccess, ApiKeyArea } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useKeyPlugins } from './useKeyPlugins';

/** One API call a key can be given. */
export interface KeyCallChoice {
  name: string;
  label: string;
  method: string;
  path: string;
  access: ApiKeyAccess;
  permission: string | null;
}

/** A call's summary up to its first full stop or aside: "Create a customer". */
const labelOf = (summary: string | null, name: string) =>
  summary?.split(/\.\s|\s\(|;\s/)[0]?.replace(/\.$/, '') || name;

/** The calls a key can make, by area, and the words for a call or a plugin action. */
export const useKeyCalls = () => {
  const calls = useQuery(orpc.apiKeys.calls.queryOptions());
  const plugins = useKeyPlugins();

  return useMemo(() => {
    const all: (KeyCallChoice & { area: string | null })[] = (calls.data?.data ?? []).map(
      (call) => ({
        name: call.procedure,
        label: labelOf(call.summary, call.procedure),
        method: call.method,
        path: call.path,
        access: call.access,
        permission: call.permission,
        area: call.area,
      }),
    );

    const labels = new Map(all.map((call) => [call.name, call.label]));

    return {
      all,
      /** The calls a key can make in the area. */
      inArea: (area: ApiKeyArea): KeyCallChoice[] => all.filter((call) => call.area === area),
      /** A call's or a plugin action's words. */
      labelOf: (name: string) => labels.get(name) ?? plugins.labelOf(name),
    };
  }, [calls.data, plugins]);
};
