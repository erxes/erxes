import { IconLayoutGrid, IconLock } from '@tabler/icons-react';
import { Button, InfoCard, Sheet, Spinner, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutEditor } from 'ui-modules';
import {
  TicketCreateFormFooter,
  TicketCreateFormHeader,
  TicketLayoutChip,
} from '@/pipelines/components/TicketCreateFormChrome';
import { TicketLayoutFieldsPanel } from '@/pipelines/components/TicketLayoutFieldsPanel';
import { useTicketLayoutFields } from '@/pipelines/hooks/useTicketLayoutFields';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { useUpdatePipeline } from '@/pipelines/hooks/useUpdatePipeline';
import { DEFAULT_TICKET_CREATE_LAYOUT } from '@/ticket/constants/createLayout';

const usePipelineCreateFormLayout = (pipelineId?: string) => {
  const { pipeline, loading: pipelineLoading } = useGetPipeline(pipelineId);
  const { updatePipeline, loading: saving } = useUpdatePipeline();
  const {
    items,
    loading: itemsLoading,
    saving: rulesSaving,
    setCreateOn,
    setRequired,
  } = useTicketLayoutFields();
  const [open, setOpen] = useState(false);

  const isCustom = !!pipeline?.createLayout?.length;
  const rows = isCustom
    ? (pipeline?.createLayout ?? [])
    : DEFAULT_TICKET_CREATE_LAYOUT;
  const itemById = new Map(items.map((item) => [item.id, item]));
  const lockedCount = rows
    .flat()
    .filter((id) => itemById.get(id)?.dimmed).length;

  const handleSave = (layout: string[][] | null) => {
    if (!pipeline) {
      return;
    }

    updatePipeline({
      variables: { _id: pipeline._id, name: pipeline.name, createLayout: layout },
      onCompleted: () => setOpen(false),
    });
  };

  return {
    pipeline,
    loading: pipelineLoading || itemsLoading,
    items,
    itemById,
    rows,
    isCustom,
    lockedCount,
    open,
    setOpen,
    saving,
    handleSave,
    fieldActions: { setCreateOn, setRequired, saving: rulesSaving },
  };
};

export const PipelineCreateFormLayout = ({
  pipelineId,
}: {
  pipelineId?: string;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const {
    pipeline,
    loading,
    items,
    itemById,
    rows,
    isCustom,
    lockedCount,
    open,
    setOpen,
    saving,
    handleSave,
    fieldActions,
  } = usePipelineCreateFormLayout(pipelineId);

  return (
    <InfoCard
      title={t('create-form', 'Create form')}
      description={t(
        'create-form-description',
        'Arrange the fields people fill in when they create a ticket in this pipeline. Name, channel, pipeline, status and description are always there.',
      )}
    >
      <InfoCard.Content className="flex flex-col gap-3">
        {loading ? (
          <Spinner containerClassName="py-6" />
        ) : (
          <>
            {lockedCount > 0 && (
              <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm">
                <IconLock className="mt-0.5 size-4 shrink-0 text-warning" />
                <span className="flex-1">
                  {t(
                    'create-form-locked-count',
                    '{{count}} of these fields are off for create or cannot be shown, so the form leaves them out.',
                    { count: lockedCount },
                  )}
                </span>
                <button
                  type="button"
                  className="shrink-0 font-medium text-primary hover:underline"
                  onClick={() => setOpen(true)}
                >
                  {t('fix-in-editor', 'Fix in editor')}
                </button>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {rows.map((row) => (
                <div key={row.join('|')} className="flex flex-wrap gap-2">
                  {row.map((id) => {
                    const item = itemById.get(id);

                    return (
                      <span
                        key={id}
                        className={cn(
                          'flex items-center gap-1 rounded px-2 py-1 text-sm',
                          item?.dimmed
                            ? 'border border-dashed text-muted-foreground'
                            : 'bg-muted',
                        )}
                      >
                        {item?.dimmed && <IconLock className="size-3.5" />}
                        {item?.name ?? t('removed-field', 'Removed field')}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={!pipeline}
                onClick={() => setOpen(true)}
              >
                <IconLayoutGrid />
                {t('edit-layout', 'Edit layout')}
              </Button>
              <span className="text-xs text-muted-foreground">
                {isCustom
                  ? t('create-form-custom', 'Custom layout for this pipeline')
                  : t('create-form-default', 'Default layout')}
              </span>
            </div>
          </>
        )}
      </InfoCard.Content>
      <Sheet open={open} onOpenChange={setOpen}>
        <Sheet.View className="p-0 sm:max-w-5xl">
          {open && (
            <LayoutEditor
              title={t('create-form', 'Create form')}
              items={items}
              initialRows={rows}
              saving={saving}
              onSave={handleSave}
              onClose={() => setOpen(false)}
              header={<TicketCreateFormHeader />}
              footer={<TicketCreateFormFooter />}
              renderChip={(item) => (
                <TicketLayoutChip item={itemById.get(item.id)} />
              )}
              aside={(api) => (
                <TicketLayoutFieldsPanel
                  items={items}
                  api={api}
                  actions={fieldActions}
                />
              )}
            />
          )}
        </Sheet.View>
      </Sheet>
    </InfoCard>
  );
};
