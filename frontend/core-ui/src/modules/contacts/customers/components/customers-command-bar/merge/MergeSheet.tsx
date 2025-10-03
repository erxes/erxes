import {
  IconArrowMerge,
  IconLayoutSidebarLeftCollapse,
} from '@tabler/icons-react';
import { Button, Sheet, cn } from 'erxes-ui';
import { ReactNode } from 'react';
import { MergeTooltip } from '@/contacts/customers/components/customers-command-bar/merge/MergeTooltip';

const noop = () => {
  //
};
interface MergeSheetProps extends React.ComponentProps<typeof Sheet> {
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  onDiscard?: () => void;
  onSave?: () => void;
}

export const MergeSheet = ({
  children,
  disabled = false,
  className,
  onDiscard = noop,
  onSave = noop,
  ...props
}: MergeSheetProps) => {
  return (
    <Sheet {...props}>
      <MergeTooltip disabled={!disabled}>
        <Sheet.Trigger asChild>
          <Button variant={'secondary'} disabled={disabled}>
            <IconArrowMerge />
            Merge
          </Button>
        </Sheet.Trigger>
      </MergeTooltip>
      <Sheet.View className="sm:max-w-screen-lg flex gap-0 flex-col m-0 p-0">
        <MergeSheetHeader />
        <Sheet.Content>
          <div className={cn('w-full h-full overflow-y-auto ', className)}>
            {children}
          </div>
        </Sheet.Content>
        {!disabled && (
          <MergeSheetFooter onDiscard={onDiscard} onSave={onSave} />
        )}
      </Sheet.View>
    </Sheet>
  );
};

const MergeSheetHeader = () => (
  <Sheet.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
    <Button variant="ghost" size="icon">
      <IconLayoutSidebarLeftCollapse />
    </Button>
    <Sheet.Title>Merge Customers</Sheet.Title>
    <Sheet.Close />
  </Sheet.Header>
);

interface MergeSheetFooterProps {
  onDiscard: () => void;
  onSave: () => void;
}

const MergeSheetFooter = ({ onDiscard, onSave }: MergeSheetFooterProps) => {
  return (
    <Sheet.Footer className="flex justify-end p-5">
      <Button
        onClick={() => {
          onDiscard();
        }}
        variant="secondary"
      >
        Discard
      </Button>
      <Button
        onClick={() => {
          onSave();
        }}
      >
        Save
      </Button>
    </Sheet.Footer>
  );
};
