import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  return (
    <Sheet {...props}>
      <Sheet.Trigger asChild>
        <Button variant={'secondary'} disabled={disabled}>
          <IconArrowMerge />
          {t('action-merge')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-5xl flex gap-0 flex-col m-0 p-0">
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
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  return (
    <Sheet.Footer className="flex justify-end p-5">
      <Button
        onClick={() => {
          onDiscard();
        }}
        variant="secondary"
      >
        {t('action-discard')}
      </Button>
      <Button
        onClick={() => {
          onSave();
        }}
      >
        {t('action-save')}
      </Button>
    </Sheet.Footer>
  );
};

export const CompaniesMergeSheetTrigger = ({
  disabled = false,
}: {
  disabled?: boolean;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  return (
    <CompaniesMergeTooltip disabled={!disabled}>
      <Button variant={'secondary'} disabled={disabled}>
        <IconArrowMerge />
        {t('action-merge')}
      </Button>
    </CompaniesMergeTooltip>
  );
};
