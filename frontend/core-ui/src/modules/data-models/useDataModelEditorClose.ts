import { useConfirm } from 'erxes-ui';

export const useDataModelEditorClose = ({
  dirty,
  loading,
  onClose,
}: {
  dirty: boolean;
  loading: boolean;
  onClose: () => void;
}): (() => Promise<void>) => {
  const { confirm } = useConfirm();
  return async () => {
    if (loading) return;
    if (dirty) {
      try {
        await confirm({
          message: 'Discard unsaved changes?',
          options: {
            description: 'Your entries have not been saved.',
            okLabel: 'Discard changes',
            cancelLabel: 'Keep editing',
            variants: { ok: 'destructive' },
          },
        });
      } catch {
        return;
      }
    }
    onClose();
  };
};
