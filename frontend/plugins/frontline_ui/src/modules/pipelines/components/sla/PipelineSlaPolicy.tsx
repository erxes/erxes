import { Button, Form, Input, Spinner, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PROJECT_PRIORITIES_OPTIONS } from '@/ticket/constants/priorityOption';
import { usePipelineSlaForm } from '@/pipelines/hooks/usePipelineSlaForm';

export const PipelineSlaPolicy = ({ pipelineId }: { pipelineId: string }) => {
  const { t } = useTranslation('frontline');
  const { form, loading, saving, save } = usePipelineSlaForm(pipelineId);
  const enabled = form.watch('enabled');
  const rules = form.watch('rules');

  if (loading) {
    return <Spinner containerClassName="py-8" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={save} className="flex flex-col gap-5">
        <Form.Field
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <Form.Item className="flex items-start justify-between gap-4 space-y-0">
              <div className="space-y-1">
                <Form.Label>{t('pipeline-sla-enabled', 'Keep an SLA')}</Form.Label>
                <Form.Description>
                  {t(
                    'pipeline-sla-description',
                    "Each priority promises a first response and a resolution time. Time counts the ticket's branch working hours; a ticket without a branch counts clock time.",
                  )}
                </Form.Description>
              </div>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Form.Item>
          )}
        />

        {enabled ? (
          <>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">
                      {t('priority', 'Priority')}
                    </th>
                    <th className="px-3 py-2 font-medium">
                      {t('pipeline-sla-first-response', 'First response (hours)')}
                    </th>
                    <th className="px-3 py-2 font-medium">
                      {t('pipeline-sla-resolution', 'Resolution (hours)')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule, index) => (
                    <tr key={rule.priority} className="border-t">
                      <td className="px-3 py-2">
                        {t(
                          PROJECT_PRIORITIES_OPTIONS[rule.priority],
                          PROJECT_PRIORITIES_OPTIONS[rule.priority],
                        )}
                      </td>
                      {(['firstResponseHours', 'resolutionHours'] as const).map(
                        (key) => (
                          <td key={key} className="px-3 py-2">
                            <Form.Field
                              control={form.control}
                              name={`rules.${index}.${key}`}
                              render={({ field }) => (
                                <Form.Item>
                                  <Form.Control>
                                    <Input
                                      type="number"
                                      min={0}
                                      step={0.5}
                                      placeholder="—"
                                      className="h-8 w-28"
                                      value={field.value || ''}
                                      onChange={field.onChange}
                                    />
                                  </Form.Control>
                                  <Form.Message />
                                </Form.Item>
                              )}
                            />
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              {t(
                'pipeline-sla-empty-row',
                'Leave a row empty to keep no promise for that priority.',
              )}
            </p>

            <Form.Field
              control={form.control}
              name="warnBeforeHours"
              render={({ field }) => (
                <Form.Item className="max-w-xs">
                  <Form.Label>
                    {t('pipeline-sla-warn-before', 'Warn before (hours)')}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      type="number"
                      min={0}
                      step={0.25}
                      placeholder="—"
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Description>
                    {t(
                      'pipeline-sla-warn-description',
                      'The Ticket SLA automation trigger fires this long before a due time, and again when it is missed.',
                    )}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </>
        ) : null}

        <div className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={saving || !form.formState.isDirty}>
            {saving ? <Spinner /> : t('save', 'Save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
