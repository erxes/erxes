import { useRemoveSelectedNodes } from '@/automations/components/builder/hooks/useRemoveSelectedNodes';
import { useState } from 'react';

export const useDeleteSelectedNodesAlert = ({
  selectedIds,
  onDeleted,
}: {
  selectedIds: string[];
  onDeleted: () => void;
}) => {
  const { removeNodes } = useRemoveSelectedNodes();
  const [isOpen, setOpen] = useState(false);

  const onDelete = () => {
    removeNodes(selectedIds);
    setOpen(false);
    onDeleted();
  };

  return { isOpen, setOpen, onDelete };
};
