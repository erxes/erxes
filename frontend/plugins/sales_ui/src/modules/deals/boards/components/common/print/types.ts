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

export type ProcessDocumentData = {
  documentsProcess?: string;
};

export type ProcessDocumentVariables = {
  _id: string;
  replacerIds: string[];
  config: {
    copies: number;
    width: number;
    height: number;
    type: string;
    brandId: string;
    branchId: string;
    departmentId: string;
  };
};
