import {
  type AssistantMessagePart,
  type AssistantProvider,
  AssistantThinkingLevel,
  type coreContract,
} from '@erxes/core-contract';
import type { InferContractRouterOutputs } from '@orpc/contract';
import type { PickedModel } from './assistantState';

type Catalog = InferContractRouterOutputs<typeof coreContract>['assistant']['models']['data'];

type CatalogModel = Catalog[number]['models'][number];

export interface ModelRun {
  provider: AssistantProvider;
  model: string | undefined;
  label: string | null;
  thinkingLevel: AssistantThinkingLevel | undefined;
  levels: AssistantThinkingLevel[];
}

type Settings = InferContractRouterOutputs<typeof coreContract>['assistant']['settings'];

interface Choice {
  providers: AssistantProvider[];
  preferred: Pick<Settings, 'defaultProvider' | 'defaultModel'>;
  catalog: (Omit<Catalog[number], 'models'> & {
    models: Pick<CatalogModel, 'id' | 'name' | 'recommended' | 'thinking'>[];
  })[];
  picked: PickedModel;
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

const connectedOf = (
  providers: AssistantProvider[],
  provider: AssistantProvider | null | undefined,
) => providers.find((candidate) => candidate === provider);

export const modelToRun = ({ providers, preferred, catalog, picked }: Choice): ModelRun | null => {
  const kept = connectedOf(providers, picked.provider);
  const provider = kept ?? connectedOf(providers, preferred.defaultProvider) ?? providers[0];

  if (!provider) return null;

  const models = catalog.find((entry) => entry.provider === provider)?.models ?? [];

  const wanted =
    (kept ? picked.model : undefined) ??
    (provider === preferred.defaultProvider ? (preferred.defaultModel ?? undefined) : undefined);

  const model =
    (wanted ? models.find((entry) => entry.id === wanted) : undefined) ??
    models.find((entry) => entry.recommended) ??
    models[0];

  const id = model?.id ?? wanted;
  const levels = model?.thinking?.levels ?? [];

  return {
    provider,
    model: id,
    label: model ? (model.name ?? model.id) : (id ?? null),
    levels,
    thinkingLevel: nearestLevel(picked.thinkingLevel ?? 'off', levels),
  };
};

/** What `assistant.send` gets: the message, its thread, and the model that will run. */
export const sendRequest = ({
  threadId,
  parts,
  run,
}: {
  threadId: string | null;
  parts: AssistantMessagePart[];
  run: Pick<ModelRun, 'provider' | 'model' | 'thinkingLevel'> | null;
}) => ({
  ...(threadId ? { threadId } : {}),
  message: { parts },
  ...(run ? { provider: run.provider } : {}),
  ...(run?.model ? { model: run.model } : {}),
  ...(run?.thinkingLevel ? { thinkingLevel: run.thinkingLevel } : {}),
});
