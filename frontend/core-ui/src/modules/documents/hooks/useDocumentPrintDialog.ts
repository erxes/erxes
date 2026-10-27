import { useState } from 'react';

export const useDocumentPrintDialog = (
  onOpenChange: (open: boolean) => void,
): {
  replacerId: string;
  setReplacerId: (id: string) => void;
  printReplacerId: string;
  printOpen: boolean;
  setPrintOpen: (open: boolean) => void;
  handleOpenChange: (open: boolean) => void;
  handleContinue: () => void;
} => {
  const [replacerId, setReplacerId] = useState('');
  const [printReplacerId, setPrintReplacerId] = useState('');
  const [printOpen, setPrintOpen] = useState(false);
  const handleOpenChange = (open: boolean): void => {
    onOpenChange(open);
    if (!open) setReplacerId('');
  };
  const handleContinue = (): void => {
    if (!replacerId) return;
    setPrintReplacerId(replacerId);
    setReplacerId('');
    onOpenChange(false);
    setPrintOpen(true);
  };
  return {
    replacerId,
    setReplacerId,
    printReplacerId,
    printOpen,
    setPrintOpen,
    handleOpenChange,
    handleContinue,
  };
};
