import { IconCalendarPlus, IconPhoto } from '@tabler/icons-react';
import { IBranch } from '@/tms/types/branch';
import { format } from 'date-fns';
import { Avatar, readImage } from 'erxes-ui';
import { ActionMenu } from './ActionMenu';

interface BranchCardProps {
  branch: IBranch;
  onEdit: (branchId: string) => void;
  onDuplicate: (branchId: string) => void;
  onDelete: (branchId: string) => void;
  duplicateLoading: boolean;
}

export const BranchCard = ({
  branch,
  onEdit,
  onDuplicate,
  onDelete,
  duplicateLoading,
}: BranchCardProps) => {
  return (
    <div className="flex flex-col items-start p-1 w-full h-full sm:p-2 bg-background shrink-0">
      <div className="flex gap-2 items-start self-stretch sm:gap-4">
        <div className="flex flex-col items-start w-full sm:w-[290px] rounded-sm bg-background shadow-lg">
          <div className="flex justify-between items-center self-stretch px-2 h-8 sm:px-3 sm:h-9">
            <div className="flex flex-1 gap-1 items-center min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold leading-[100%] text-foreground font-inter truncate">
                {branch.name || 'Unnamed Branch'}
              </h3>
            </div>

            <ActionMenu
              onEdit={() => onEdit(branch._id)}
              onDuplicate={() => onDuplicate(branch._id)}
              onDelete={() => onDelete(branch._id)}
              duplicateLoading={duplicateLoading}
            />
          </div>

          <div className="flex h-[120px] sm:h-[150px] w-full flex-col items-start gap-2 sm:gap-3 self-stretch">
            <div className="flex justify-center items-center w-full h-full bg-accent/30">
              {branch.uiOptions?.logo ? (
                <img
                  src={readImage(branch.uiOptions.logo)}
                  alt={branch.name || 'Branch logo'}
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="flex flex-col gap-2 justify-center items-center text-muted-foreground">
                  <IconPhoto size={48} className="opacity-40" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center self-stretch px-2 h-8 sm:px-3 sm:h-9">
            <div className="flex flex-1 gap-1 items-center min-w-0 sm:gap-2">
              <IconCalendarPlus
                size={16}
                className="flex-shrink-0 text-foreground"
              />
              <span className="text-[10px] sm:text-[12px] font-semibold leading-[100%] font-inter truncate">
                Created:{' '}
                {branch.createdAt
                  ? format(new Date(branch.createdAt), 'dd MMM yyyy')
                  : 'N/A'}
              </span>
            </div>

            <Avatar className="flex-shrink-0 w-5 h-5 rounded-full border shadow-sm sm:w-6 sm:h-6">
              {branch.user?.details?.avatar ? (
                <Avatar.Image
                  src={branch.user.details.avatar}
                  alt={branch.user.details.fullName || 'User avatar'}
                />
              ) : null}
              <Avatar.Fallback>
                {branch.user?.details?.fullName
                  ?.split(' ')[0]
                  ?.charAt(0)
                  ?.toUpperCase() || 'A'}
              </Avatar.Fallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
};
