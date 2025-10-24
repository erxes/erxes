export const PosHotKeyScope = {
  PosPage: 'pos-page',
  PosAddSheet: 'pos-add-sheet',
  PosEditSheet: 'pos-edit-sheet',
  PosAddSheetDescriptionField: 'pos-add-sheet-description-field',
  PosAddSheetBarcodeDescriptionField: 'pos-add-sheet-barcode-description-field',
} as const;

export type PosHotKeyScope =
  (typeof PosHotKeyScope)[keyof typeof PosHotKeyScope];
