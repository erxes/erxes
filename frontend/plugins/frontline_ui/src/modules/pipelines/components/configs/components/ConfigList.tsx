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
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { TICKET_FORM_FIELDS } from '@/pipelines/components/configs/constant';
import { configCreateModalAtom } from '../states';

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
  const [, setConfigId] = useQueryState<string | undefined>('configId');

  const onRemove = () => {
    confirm({
      message: t('confirm-remove-configuration'),
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
        <DropdownMenu.Item onSelect={() => setConfigId(configId)}>
          <IconEdit />
          {t('edit')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          className="text-destructive"
          disabled={loading}
          onSelect={onRemove}
        >
          <IconTrash />
          {t('delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const ConfigList = () => {
  const { t } = useTranslation('frontline');
  const setCreateOpen = useSetAtom(configCreateModalAtom);
  const [, setConfigId] = useQueryState<string | undefined>('configId');
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
          <Empty.Title>{t('messenger-configuration')}</Empty.Title>
          <Empty.Description>
            {t('configure-messenger-configuration')}
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button onClick={() => setCreateOpen(true)}>
            <IconPlus />
            {t('add-configuration')}
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <PipelineSection title={t('messenger-configuration')}>
      {loading || !ticketConfig ? (
        <ConfigRowSkeleton />
      ) : (
        <div className="flex h-12 items-center gap-3 rounded-md border bg-background px-2 transition-colors hover:bg-accent">
          <Button
            className="h-auto min-w-0 flex-1 justify-start gap-3 whitespace-normal px-0 py-0 text-left font-normal hover:bg-transparent"
            onClick={() => setConfigId(ticketConfig.id)}
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
                  : t('no-fields-to-preview')}
              </span>
            </span>
          </Button>
          <ConfigMenu configId={ticketConfig.id} />
        </div>
      )}
    </PipelineSection>
  );
};
