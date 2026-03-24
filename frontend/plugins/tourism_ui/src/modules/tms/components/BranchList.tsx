import { useBranchList } from '@/tms/hooks/BranchList';
import { useBranchRemove } from '@/tms/hooks/BranchRemove';
import { useBranchDuplicate } from '@/tms/hooks/BranchDuplicate';
import { useBranchEdit } from '@/tms/hooks/BranchEdit';
import { IBranch } from '@/tms/types/branch';
import { EmptyList } from './EmptyList';
import { BranchCard } from './BranchCard';
import { Sheet, Spinner, useConfirm } from 'erxes-ui';
import CreateTmsForm from './CreateTmsForm';
import { useVisitWebsite } from '~/hooks/useVisitWebsite';

export const BranchList = () => {
  const { list, totalCount, loading, error, refetch } = useBranchList();

  const { handleDeleteBranch } = useBranchRemove();

  const { handleDuplicateBranch, loading: duplicateLoading } =
    useBranchDuplicate();

  const { editingBranch, handleEditBranch, closeEditDialog } = useBranchEdit();

  const { confirm } = useConfirm();

  const onVisitWebsite = useVisitWebsite('tms', list);

  const deleteConfirmOptions = { confirmationValue: 'delete' };
  const duplicateConfirmOptions = { confirmationValue: 'duplicate' };

  const onDuplicate = (branchId: string) => {
    const branchName = list?.find((b) => b._id === branchId)?.name || '';
    const branch = list?.find((b) => b._id === branchId);
    if (!branch) return;

    confirm({
      message: `Are you sure you want to create a duplicate of "${branchName}"?`,
      options: duplicateConfirmOptions,
    }).then(async () => {
      await handleDuplicateBranch(branch, refetch);
    });
  };

  const onDelete = (branchId: string) => {
    const branchName = list?.find((b) => b._id === branchId)?.name || '';

    confirm({
      message: `Are you sure you want to permanently delete "${branchName}"?`,
      options: deleteConfirmOptions,
    }).then(async () => {
      await handleDeleteBranch(branchId, refetch);
    });
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
      <div className="w-full p-2 sm:p-3 md:p-4 flex flex-col min-h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {list.map((branch: IBranch) => (
            <BranchCard
              key={branch._id}
              branch={branch}
              onEdit={handleEditBranch}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onVisitWebsite={onVisitWebsite}
              duplicateLoading={duplicateLoading}
            />
          ))}
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
    </>
  );
};
