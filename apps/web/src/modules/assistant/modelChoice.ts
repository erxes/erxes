import {
  type AssistantConnection,
  type AssistantProvider,
  AssistantThinkingLevel,
  type coreContract,
} from '@erxes/core-contract';
import type { InferContractRouterOutputs } from '@orpc/contract';

type Catalog = InferContractRouterOutputs<typeof coreContract>['assistant']['models']['data'];

type CatalogModel = Catalog[number]['models'][number];

interface Picked {
  provider?: AssistantProvider;
  model?: string;
  thinkingLevel?: AssistantThinkingLevel;
}

export interface ModelRun {
  provider: AssistantProvider;
  model: string | undefined;
  label: string | null;
  thinkingLevel: AssistantThinkingLevel | undefined;
  levels: AssistantThinkingLevel[];
}

interface Choice {
  connections: Pick<AssistantConnection, 'provider' | 'isDefault'>[];
  catalog: (Omit<Catalog[number], 'models'> & {
    models: Pick<CatalogModel, 'id' | 'name' | 'recommended' | 'thinking'>[];
  })[];
  picked: Picked;
}

const rank = (level: AssistantThinkingLevel) => AssistantThinkingLevel.options.indexOf(level);

const nearestLevel = (asked: AssistantThinkingLevel, levels: AssistantThinkingLevel[]) =>
  levels.includes(asked)
    ? asked
    : levels.reduce<AssistantThinkingLevel | undefined>((best, candidate) => {
        if (best === undefined) return candidate;

        const distance = Math.abs(rank(candidate) - rank(asked));
        const bestDistance = Math.abs(rank(best) - rank(asked));

        return distance < bestDistance ||
          (distance === bestDistance && rank(candidate) > rank(best))
          ? candidate
          : best;
      }, undefined);

export const modelToRun = ({ connections, catalog, picked }: Choice): ModelRun | null => {
  const saved = connections.find((connection) => connection.provider === picked.provider);
  const provider = (saved ?? connections.find((c) => c.isDefault) ?? connections[0])?.provider;

  if (!provider) return null;

  const models = catalog.find((entry) => entry.provider === provider)?.models ?? [];
  const keepPick = saved !== undefined && picked.model !== undefined;

  const model =
    (keepPick ? models.find((entry) => entry.id === picked.model) : undefined) ??
    models.find((entry) => entry.recommended) ??
    models[0];

  const id = model?.id ?? (keepPick ? picked.model : undefined);
  const levels = model?.thinking?.levels ?? [];

  return {
    provider,
    model: id,
    label: model ? (model.name ?? model.id) : (id ?? null),
    levels,
    thinkingLevel: nearestLevel(picked.thinkingLevel ?? 'off', levels),
  };
};
