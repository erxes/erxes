export type TFxaOwnerRecordActionMode = 'receive' | 'transfer' | 'handOver';

export const FXA_OWNER_RECORD_CONTENT_TYPES: Record<
  TFxaOwnerRecordActionMode,
  string
> = {
  receive: 'accounting:fxaOwnerReceive',
  transfer: 'accounting:fxaOwnerTransfer',
  handOver: 'accounting:fxaOwnerHandOver',
};

export const FXA_OWNER_RECORD_PANEL_CONTENT_TYPES = Object.values(
  FXA_OWNER_RECORD_CONTENT_TYPES,
);
