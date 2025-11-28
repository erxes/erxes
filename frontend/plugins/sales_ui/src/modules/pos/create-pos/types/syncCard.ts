export interface SyncCardConfig {
  branchId: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  assignedUserIds: string[];
  deliveryMapField: string;
  title: string;
}

export type CardsConfig = Record<string, SyncCardConfig>;
