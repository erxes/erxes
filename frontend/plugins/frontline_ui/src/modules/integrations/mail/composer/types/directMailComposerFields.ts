export interface DirectMailComposerFieldsState {
  showCc: boolean;
  showBcc: boolean;
  openCc: () => void;
  openBcc: () => void;
  closeEmptyFields: () => void;
}
