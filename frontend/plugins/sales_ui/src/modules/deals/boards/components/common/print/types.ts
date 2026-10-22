export type PrintDialogProps = {
  open: boolean;
  onClose: () => void;
  stageId: string;
};

export type PrintFormValues = {
  copies: number;
  width: number;
  brandId: string;
  branchId: string;
  departmentId: string;
  documentId: string;
};
