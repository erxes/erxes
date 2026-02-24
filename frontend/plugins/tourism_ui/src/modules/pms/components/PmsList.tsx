import { usePmsBranchList } from '@/pms/hooks/usePmsBranchList';
import { IPmsBranch } from '@/pms/types/branch';
import { format } from 'date-fns';
import {
  Spinner,
  getPluginAssetsUrl,
  readImage,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import { IconCalendarPlus, IconPhoto } from '@tabler/icons-react';
import { PmsCreateSheet } from './CreatePmsSheet';
import { usePmsRemoveBranch } from '@/pms/hooks/usePmsRemoveBranch';
import { ActionMenu } from '@/pms/components/ActionMenu';
import { Sheet } from 'erxes-ui';
import { useState } from 'react';
import CreatePmsForm from './CreatePmsForm';

function PmsListEmpty() {
  return (
    <div className="flex justify-center items-center px-4 min-h-screen">
      <div className="p-5 w-full max-w-md text-center rounded-lg shadow-lg bg-background">
        <div className="mb-4 w-full aspect-video">
          <img
            src={getPluginAssetsUrl('tourism', 'tourism-empty-state.jpg')}
            alt="tourism"
            className="object-cover w-full h-full rounded"
          />
        </div>

        <h2 className="mb-3 text-xl font-semibold text-foreground">
          Property management system
        </h2>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          A property management system is software designed to organize and
          manage property-related activities. It helps streamline trip planning,
          booking, payment management, customer information, and travel
          schedules.
        </p>

        <PmsCreateSheet />
      </div>
    </div>
  );
}

const BranchImage = ({ logo, name }: { logo?: string; name?: string }) => {
  if (!logo) {
    return (
      <div className="flex justify-center items-center w-full h-full text-muted-foreground">
        <IconPhoto size={40} className="opacity-40" />
      </div>
    );
  }

  return (
    <img
      src={readImage(logo)}
      alt={name || 'Branch logo'}
      className="object-contain w-full h-full"
      loading="lazy"
      width={290}
      height={150}
    />
  );
};

function PmsBranchCard({
  branch,
  onEdit,
  onDelete,
}: {
  branch: IPmsBranch;
  onEdit: (branchId: string) => void;
  onDelete: (branchId: string) => void;
}) {
  return (
    <div className="flex flex-col w-full rounded-sm shadow-sm bg-background">
      <div className="flex justify-between items-center px-3 py-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">
            {branch.name || 'Unnamed Branch'}
          </div>
        </div>

        <ActionMenu
          onEdit={() => onEdit(branch._id)}
          onDelete={() => onDelete(branch._id)}
        />
      </div>

      <div className="w-full h-[140px] rounded-sm bg-accent/30 overflow-hidden flex items-center justify-center">
        <BranchImage logo={branch.uiOptions?.logo} name={branch.name} />
      </div>

      <div className="flex justify-between items-center px-3 py-2 border-t">
        <div className="flex gap-2 items-center min-w-0">
          <IconCalendarPlus size={16} className="shrink-0" />
          <span className="text-xs font-medium truncate">
            Created:{' '}
            {branch.createdAt
              ? format(new Date(branch.createdAt), 'dd MMM yyyy')
              : 'N/A'}
          </span>
        </div>

        <MembersInline.Provider memberIds={[branch.userId]}>
          <MembersInline.Avatar size="lg" />
        </MembersInline.Provider>
      </div>
    </div>
  );
}

export function PmsList() {
  const { list, loading, error } = usePmsBranchList({
    page: 1,
    perPage: 50,
  });

  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [editOpen, setEditOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string>('');

  const { removeBranch } = usePmsRemoveBranch();

  const onEdit = (branchId: string) => {
    setEditingBranchId(branchId);
    setEditOpen(true);
  };

  const onDelete = (branchId: string) => {
    const branchName = list?.find((b) => b._id === branchId)?.name || '';

    confirm({
      message: 'Delete Branch',
      options: {
        description: `Are you sure you want to permanently delete "${branchName}"?`,
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      removeBranch({
        variables: { _id: branchId },
        onError: (e) => {
          toast({
            title: 'Error',
            description:
              e instanceof Error ? e.message : 'Failed to remove branch',
            variant: 'destructive',
          });
        },
      });
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-destructive">{error.message}</div>;
  }

  if (list.length === 0) {
    return <PmsListEmpty />;
  }

  return (
    <>
      <Sheet
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditingBranchId('');
          }
        }}
      >
        <Sheet.View
          className="p-0 sm:max-w-8xl"
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <CreatePmsForm
            mode="edit"
            branchId={editingBranchId}
            onOpenChange={setEditOpen}
          />
        </Sheet.View>
      </Sheet>

      <div className="w-full p-2 sm:p-3 md:p-4 flex flex-col min-h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((branch) => (
            <PmsBranchCard
              key={branch._id}
              branch={branch}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </>
  );
}
