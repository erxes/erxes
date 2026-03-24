export const PosItemsHotKeyScope = {
  PosItemsPage: 'pos-items-page',
  PosAddSheet: 'pos-add-sheet',
  PosEditSheet: 'pos-edit-sheet',
  PosAddSheetDescriptionField: 'pos-add-sheet-description-field',
  PosAddSheetBarcodeDescriptionField: 'pos-add-sheet-barcode-description-field',
} as const;

export type PosItemsHotKeyScopeType =
  (typeof PosItemsHotKeyScope)[keyof typeof PosItemsHotKeyScope];
