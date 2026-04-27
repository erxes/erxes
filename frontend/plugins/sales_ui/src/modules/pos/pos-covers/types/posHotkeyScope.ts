export const PosCoverHotKeyScope = {
  PosPage: 'pos-cover-page',
  PosAddSheet: 'pos-cover-add-sheet',
  PosEditSheet: 'pos-cover-edit-sheet',
  PosAddSheetDescriptionField: 'pos-cover-add-sheet-description-field',
  PosAddSheetBarcodeDescriptionField:
    'pos-cover-add-sheet-barcode-description-field',
} as const;

export type PosCoverHotKeyScope =
  (typeof PosCoverHotKeyScope)[keyof typeof PosCoverHotKeyScope];
