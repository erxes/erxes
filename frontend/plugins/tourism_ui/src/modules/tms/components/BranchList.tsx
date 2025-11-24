import { useState } from 'react';
import { useBranchList } from '@/tms/hooks/BranchList';
import { useBranchRemove } from '@/tms/hooks/BranchRemove';
import { useBranchDuplicate } from '@/tms/hooks/BranchDuplicate';
import { useBranchEdit } from '@/tms/hooks/BranchEdit';
import { IBranch } from '@/tms/types/branch';
import { EmptyList } from './EmptyList';
import { BranchCard } from './BranchCard';
import { ConfirmationDialog } from './ConfirmationDialog';
import { Sheet, Spinner } from 'erxes-ui';
import CreateTmsForm from './CreateTmsForm';

export const BranchList = () => {
  const { list, totalCount, loading, error, refetch } = useBranchList();

  const { handleDeleteBranch, loading: removeLoading } = useBranchRemove();

  const { handleDuplicateBranch, loading: duplicateLoading } =
    useBranchDuplicate();

  const { editingBranch, handleEditBranch, closeEditDialog } = useBranchEdit();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState<string | null>(
    null,
  );

  const onDuplicateConfirm = async () => {
    const branchId = duplicateDialogOpen;

    setDuplicateDialogOpen(null);

    const branch = list?.find((b) => b._id === branchId);

    if (branch) {
      await handleDuplicateBranch(branch, refetch);
    }
  };

  const onDeleteConfirm = async () => {
    const branchId = deleteDialogOpen;

    setDeleteDialogOpen(null);

    if (branchId) {
      await handleDeleteBranch(branchId, refetch);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh)]">
        <Spinner />
      </div>
    );

  if (error) {
    return <code className="ml-4">{error.message}</code>;
  }

  if (totalCount === 0) return <EmptyList />;

  return (
    <>
      <div className="w-full p-2 sm:p-3 md:p-4 flex flex-col min-h-[calc(100vh-150px)] sm:min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-200px)]">
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {list.map((branch: IBranch) => (
              <BranchCard
                key={branch._id}
                branch={branch}
                onEdit={handleEditBranch}
                onDuplicate={setDuplicateDialogOpen}
                onDelete={setDeleteDialogOpen}
                duplicateLoading={duplicateLoading}
              />
            ))}
          </div>
        </div>
      </div>

      <Sheet
        open={!!editingBranch}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog();
          }
        }}
      >
        {editingBranch && (
          <CreateTmsForm
            branchId={editingBranch}
            onOpenChange={(open) => {
              if (!open) {
                closeEditDialog();
              }
            }}
            onSuccess={() => {
              closeEditDialog();
            }}
            refetch={refetch}
            isOpen={!!editingBranch}
          />
        )}
      </Sheet>

      <ConfirmationDialog
        open={!!duplicateDialogOpen}
        onOpenChange={(open) => !open && setDuplicateDialogOpen(null)}
        type="duplicate"
        branchName={
          list?.find((b) => b._id === duplicateDialogOpen)?.name || ''
        }
        loading={duplicateLoading}
        onConfirm={onDuplicateConfirm}
      />

      <ConfirmationDialog
        open={!!deleteDialogOpen}
        onOpenChange={(open) => !open && setDeleteDialogOpen(null)}
        type="delete"
        branchName={list?.find((b) => b._id === deleteDialogOpen)?.name || ''}
        loading={removeLoading}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
};
