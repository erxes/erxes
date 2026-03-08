import { IconCalendarPlus, IconPhoto } from '@tabler/icons-react';
import { IBranch } from '@/tms/types/branch';
import { format } from 'date-fns';
import { readImage, Spinner } from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import { ActionMenu } from '@/tms/components/ActionMenu';
import { useState } from 'react';

interface BranchCardProps {
  branch: IBranch;
  onEdit: (branchId: string) => void;
  onDuplicate: (branchId: string) => void;
  onDelete: (branchId: string) => void;
  onVisitWebsite?: (branchId: string) => void;
  duplicateLoading: boolean;
}

const BranchImage = ({ logo, name }: { logo?: string; name?: string }) => {
  const [imageLoading, setImageLoading] = useState(true);

  if (!logo) {
    return (
      <div className="flex justify-center items-center w-full h-full text-muted-foreground">
        <IconPhoto size={40} className="opacity-40" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {imageLoading && (
        <div className="flex absolute inset-0 justify-center items-center">
          <Spinner size="md" />
        </div>
      )}
      <img
        src={readImage(logo)}
        alt={name || 'Branch logo'}
        className="object-cover w-full h-full"
        loading="lazy"
        width={290}
        height={150}
        onLoad={() => setImageLoading(false)}
        onError={() => setImageLoading(false)}
      />
    </div>
  );
};

export const BranchCard = ({
  branch,
  onEdit,
  onDuplicate,
  onDelete,
  onVisitWebsite,
  duplicateLoading,
}: BranchCardProps) => {
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
          onDuplicate={() => onDuplicate(branch._id)}
          onDelete={() => onDelete(branch._id)}
          onVisitWebsite={
            onVisitWebsite ? () => onVisitWebsite(branch._id) : undefined
          }
          duplicateLoading={duplicateLoading}
        />
      </div>

      <div className="w-full h-[140px] bg-accent/30 overflow-hidden flex items-center justify-center">
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
};
