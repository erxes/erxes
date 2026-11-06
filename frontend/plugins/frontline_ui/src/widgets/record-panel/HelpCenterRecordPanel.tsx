import { HELP_CENTER_CONTENT_TYPE } from '@/helpcenter/constants';
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
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { helpCenterRemovedIdsState } from '@/helpcenter/states/helpCenterPanelDraftsState';
import {
  ActivityLogs,
  IRecordPanelProps,
  NEW_RECORD_ID,
  useSidePanel,
} from 'ui-modules';

const HelpCenterSavedRecordPanel = ({ contentId, view }: IRecordPanelProps) => {
  const { t } = useTranslation('frontline');
  const { helpCenter, loading, error } = useHelpCenterDetail(contentId);
  const { confirmRemoveHelpCenter, loading: removing } =
    useConfirmRemoveHelpCenter();
  const { record, close, back, canGoBack } = useSidePanel();
  const removedIds = useAtomValue(helpCenterRemovedIdsState);
  useEffect(() => {
    if (
      view === 'title' &&
      record?.contentType === HELP_CENTER_CONTENT_TYPE &&
      record.contentId === contentId &&
      removedIds.has(contentId)
    ) {
      if (canGoBack) back();
      else close();
    }
  }, [view, record, contentId, removedIds, canGoBack, back, close]);

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
            {error?.message || t('not-found', 'Record not found')}
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
      onClose={() => (canGoBack ? back() : close())}
    />
  );
};

export const HelpCenterRecordPanel = (props: IRecordPanelProps) => {
  const { t } = useTranslation('frontline');
  const { back, canGoBack, close } = useSidePanel();
  if (props.contentType !== HELP_CENTER_CONTENT_TYPE) return null;
  if (props.contentId === NEW_RECORD_ID && props.view === 'title')
    return t('helpcenter-create', 'Create Help Center');
  if (props.view === 'new')
    return <HelpCenterDrawer onClose={() => (canGoBack ? back() : close())} />;
  return <HelpCenterSavedRecordPanel {...props} />;
};
