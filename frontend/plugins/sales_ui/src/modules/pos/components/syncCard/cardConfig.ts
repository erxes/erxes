import { isDefined } from 'erxes-ui';
import type { IPos } from '@/pos/types/pos';

export interface CardConfig {
  _id: string;
  branchId: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  assignedUserIds: string[];
  deliveryMapField: string;
  title: string;
}

export type CardConfigDraft = {
  posId?: string;
  configKey?: string;
};

export const toCardConfigs = (
  cardsConfig: IPos['cardsConfig'] | undefined,
): CardConfig[] =>
  Object.entries(cardsConfig ?? {}).map(([key, value]) => ({
    _id: key,
    branchId: value.branchId || '',
    boardId: value.boardId || '',
    pipelineId: value.pipelineId || '',
    stageId: value.stageId || '',
    assignedUserIds: (value.assignedUserIds ?? []).filter(isDefined),
    deliveryMapField: value.deliveryMapField || '',
    title: value.title || key,
  }));

export const toCardsConfigInput = (configs: CardConfig[]) =>
  Object.fromEntries(
    configs.map(({ _id, ...config }) => [config.title || _id, config]),
  );
