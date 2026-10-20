import type { ITriageDetail } from '@/triage/types/triage';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import type { useDescriptionEditor } from '@/operation/hooks/useDescriptionEditor';

export type TriageFieldsProps = {
  triage: ITriageDetail;
  titleAction?: ReactNode;
};

export interface TriageFieldsEditorOptions {
  triage: ITriageDetail;
  descriptionPlaceholder: string;
}
export interface TriageFieldsEditorState {
  name: ITriageDetail['name'];
  setName: Dispatch<SetStateAction<ITriageDetail['name']>>;
  editor: ReturnType<typeof useDescriptionEditor>['editor'];
  isDescriptionReady: boolean;
  confirmOpen: boolean;
  setConfirmOpen: Dispatch<SetStateAction<boolean>>;
  handleDescriptionChange: () => void;
  handlePriorityChange: (value: number) => void;
  handleStatusChange: (value: number) => void;
  handleConfirmConversion: () => void;
}

export interface TriageConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}
