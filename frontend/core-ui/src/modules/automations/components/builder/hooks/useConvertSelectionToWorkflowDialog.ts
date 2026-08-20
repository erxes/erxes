import { useConvertSelectionToWorkflow } from '@/automations/components/builder/hooks/useConvertSelectionToWorkflow';
import { useState } from 'react';

const EMPTY_DOC = { name: 'New workflow', description: '' };

export const useConvertSelectionToWorkflowDialog = ({
  actionIds,
  onConverted,
}: {
  actionIds: string[];
  onConverted: () => void;
}) => {
  const { convertSelectionToWorkflow } = useConvertSelectionToWorkflow();
  const [isOpen, setOpen] = useState(false);
  const [doc, setDoc] = useState(EMPTY_DOC);

  const onConvert = () => {
    convertSelectionToWorkflow(actionIds, doc);
    setOpen(false);
    setDoc(EMPTY_DOC);
    onConverted();
  };

  return {
    doc,
    isOpen,
    onConvert,
    setDoc,
    setOpen,
    canConvert: Boolean(doc.name.trim()),
  };
};
