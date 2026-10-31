import { HelpCenterDrawer } from '@/helpcenter/components/help-center-drawer';
import { useHelpCenterDetail } from '@/helpcenter/hooks/useHelpCenters';
import { useConfirmRemoveHelpCenter } from '@/helpcenter/hooks/useConfirmRemoveHelpCenter';
import { IconDotsVertical, IconTrash } from '@tabler/icons-react';
import {
  Button,
  DropdownMenu,
  Empty,
  ScrollArea,
  Skeleton,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ActivityLogs, IRecordPanelProps, useSidePanel } from 'ui-modules';

const HelpCenterSavedRecordPanel = ({ contentId, view }: IRecordPanelProps) => {
  const { t } = useTranslation('frontline');
  const { helpCenter, loading, error } = useHelpCenterDetail(contentId);
  const { confirmRemoveHelpCenter, loading: removing } =
    useConfirmRemoveHelpCenter();
  const { close } = useSidePanel();

  if (view === 'title')
    return loading && !helpCenter ? (
      <Skeleton className="h-4 w-32" />
    ) : (
      helpCenter?.title || t('help-center', 'Help Center')
    );
  if (view === 'actions') {
    return helpCenter ? (
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={removing}
            aria-label={t('actions', 'Actions')}
          >
            <IconDotsVertical />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item
            className="text-destructive"
            disabled={removing}
            onSelect={() => confirmRemoveHelpCenter(helpCenter)}
          >
            <IconTrash />
            {t('delete', 'Delete')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    ) : null;
  }
  if (loading && !helpCenter) return <Spinner containerClassName="py-12" />;
  if (!helpCenter) {
    return (
      <Empty>
        <Empty.Header>
          <Empty.Title>{t('help-center', 'Help Center')}</Empty.Title>
          <Empty.Description>
            {error?.message ||
              t(
                'helpcenter-not-found',
                'This help center is no longer available.',
              )}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }
  if (view === 'activity')
    return (
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        <ActivityLogs targetId={contentId} showInternalNotes={false} />
      </ScrollArea>
    );
  return (
    <HelpCenterDrawer
      key={contentId}
      helpCenter={helpCenter}
      isOpen
      onClose={close}
      panel
    />
  );
};

export const HelpCenterRecordPanel = (props: IRecordPanelProps) => {
  const { back, canGoBack, close } = useSidePanel();
  if (props.view === 'new')
    return (
      <HelpCenterDrawer
        isOpen
        onClose={() => (canGoBack ? back() : close())}
        panel
      />
    );
  return <HelpCenterSavedRecordPanel {...props} />;
};
