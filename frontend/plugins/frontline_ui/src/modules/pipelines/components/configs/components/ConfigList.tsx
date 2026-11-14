import { useRemoveTicketConfig } from '@/pipelines/components/configs/hooks/useRemoveTicketConfig';
import { useGetTicketConfigByPipelineId } from '@/pipelines/components/configs/hooks/useGetTicketConfigByPipelineId';
import { PipelineSection } from '@/pipelines/components/PipelineSection';
import {
  IconDots,
  IconEdit,
  IconMessageCog,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  DropdownMenu,
  Empty,
  Skeleton,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TICKET_FORM_FIELDS } from '@/pipelines/components/configs/constant';
import { useSidePanel } from 'ui-modules';
import { TICKET_CONFIG_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';

const ConfigRowSkeleton = () => (
  <div className="flex h-12 items-center gap-3 px-2">
    <Skeleton className="size-7 flex-none rounded" />
    <div className="flex flex-col gap-1">
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-2.5 w-20" />
    </div>
  </div>
);

const ConfigMenu = ({ configId }: { configId: string }) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const { removeTicketConfig, loading } = useRemoveTicketConfig();
  const { openRecord, record } = useSidePanel();

  const onRemove = () => {
    confirm({
      message: t(
        'confirm-remove-configuration',
        'Are you sure you want to remove this configuration?',
      ),
      options: { confirmationValue: 'delete' },
    }).then(() => {
      removeTicketConfig({ variables: { id: configId } });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button className="ml-auto" size="icon" variant="ghost">
          {loading ? <Spinner size="sm" /> : <IconDots />}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-40">
        <DropdownMenu.Item
          onSelect={() =>
            openRecord(
              { contentType: TICKET_CONFIG_CONTENT_TYPE, contentId: configId },
              { stack: Boolean(record) },
            )
          }
        >
          <IconEdit />
          {t('edit', 'Edit')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          className="text-destructive"
          disabled={loading}
          onSelect={onRemove}
        >
          <IconTrash />
          {t('delete', 'Delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const ConfigList = () => {
  const { t } = useTranslation('frontline');
  const { id: channelId, pipelineId } = useSettingsParams();
  const { openRecord, record } = useSidePanel();
  const { ticketConfig, loading } = useGetTicketConfigByPipelineId();

  const formFields = ticketConfig?.formFields;
  const shownFields = TICKET_FORM_FIELDS.filter(
    (field) => formFields?.[field.key]?.isShow,
  )
    .sort(
      (a, b) =>
        (formFields?.[a.key]?.order ?? 0) - (formFields?.[b.key]?.order ?? 0),
    )
    .map((field) => t(field.label));

  if (!loading && !ticketConfig) {
    return (
      <Empty className="rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media>
            <IconMessageCog />
          </Empty.Media>
          <Empty.Title>
            {t('messenger-configuration', 'Messenger Configuration')}
          </Empty.Title>
          <Empty.Description>
            {t(
              'configure-messenger-configuration',
              'Configure the messenger configuration',
            )}
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button
            onClick={() =>
              openRecord(
                {
                  contentType: TICKET_CONFIG_CONTENT_TYPE,
                  contentId: `new~${channelId}~${pipelineId}`,
                },
                { stack: Boolean(record) },
              )
            }
          >
            <IconPlus />
            {t('add-configuration', 'Add Configuration')}
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <PipelineSection
      title={t('messenger-configuration', 'Messenger Configuration')}
    >
      {loading || !ticketConfig ? (
        <ConfigRowSkeleton />
      ) : (
        <div className="flex h-12 items-center gap-3 rounded-md border bg-background px-2 transition-colors hover:bg-accent">
          <Button
            className="h-auto min-w-0 flex-1 justify-start gap-3 whitespace-normal px-0 py-0 text-left font-normal hover:bg-transparent"
            onClick={() =>
              openRecord(
                {
                  contentType: TICKET_CONFIG_CONTENT_TYPE,
                  contentId: ticketConfig.id,
                },
                { stack: Boolean(record) },
              )
            }
            variant="ghost"
          >
            <span className="flex size-7 flex-none items-center justify-center rounded bg-primary/10 text-primary">
              <IconMessageCog className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {ticketConfig.name}
              </span>
              <span className="truncate font-mono text-xs uppercase text-muted-foreground">
                {shownFields.length
                  ? shownFields.join(' · ')
                  : t('no-fields-to-preview', 'No fields to preview')}
              </span>
            </span>
          </Button>
          <ConfigMenu configId={ticketConfig.id} />
        </div>
      )}
    </PipelineSection>
  );
};
