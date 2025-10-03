import {
  IconArrowMerge,
  IconLayoutSidebarLeftCollapse,
} from '@tabler/icons-react';
import { Button, Sheet, cn } from 'erxes-ui';
import { ReactNode } from 'react';
import { CompaniesMergeTooltip } from '@/contacts/companies/components/companies-command-bar/CompaniesMergeTooltip';

const noop = () => {
  //
};
interface CompaniesMergeSheetProps extends React.ComponentProps<typeof Sheet> {
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  onDiscard?: () => void;
  onSave?: () => void;
}

export const CompaniesMergeSheet = ({
  children,
  disabled = false,
  className,
  onDiscard = noop,
  onSave = noop,
  ...props
}: CompaniesMergeSheetProps) => {
  return (
    <Sheet {...props}>
      <Sheet.Trigger asChild>
        <Button variant={'secondary'} disabled={disabled}>
          <IconArrowMerge />
          Merge
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-screen-lg flex gap-0 flex-col m-0 p-0">
        <Sheet.Description className="sr-only" />
        <CompaniesMergeSheetHeader />
        <Sheet.Content>
          <div className={cn('w-full h-full overflow-y-auto ', className)}>
            {children}
          </div>
        </Sheet.Content>
        {!disabled && (
          <CompaniesMergeSheetFooter onDiscard={onDiscard} onSave={onSave} />
        )}
      </Sheet.View>
    </Sheet>
  );
};

const CompaniesMergeSheetHeader = () => (
  <Sheet.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
    <Button variant="ghost" size="icon">
      <IconLayoutSidebarLeftCollapse />
    </Button>
    <Sheet.Title>Merge Companies</Sheet.Title>
    <Sheet.Close />
  </Sheet.Header>
);

interface CompaniesMergeSheetFooterProps {
  onDiscard: () => void;
  onSave: () => void;
}

const CompaniesMergeSheetFooter = ({
  onDiscard,
  onSave,
}: CompaniesMergeSheetFooterProps) => {
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

export const CompaniesMergeSheetTrigger = ({
  disabled = false,
}: {
  disabled?: boolean;
}) => {
  return (
    <CompaniesMergeTooltip disabled={!disabled}>
      <Button variant={'secondary'} disabled={disabled}>
        <IconArrowMerge />
        Merge
      </Button>
    </CompaniesMergeTooltip>
  );
};
