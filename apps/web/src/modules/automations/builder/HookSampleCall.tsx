import type { HookSample } from '@erxes/core-contract';
import { IconClipboard } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Dialog, RelativeDateDisplay, Spinner } from 'erxes-ui';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { automationQuery } from '../automationQueries';
import { BuilderContext } from './BuilderContext';
import { JsonEditor } from './JsonEditor';
import { Field } from './triggerFields';
import { useAutomationFields } from './useAutomationFields';

const PasteSample = ({ sample }: { sample: HookSample | null }) => {
  const { t } = useTranslation('automations');
  const { automationId } = useContext(BuilderContext);
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState<unknown>(sample?.body ?? undefined);
  const [query, setQuery] = useState<unknown>(sample?.query ?? undefined);

  const save = useMutation(
    orpc.automations.saveSample.mutationOptions({
      onSuccess: (next) => {
        client.setQueryData(automationQuery(automationId).queryKey, next);
        void client.invalidateQueries({ queryKey: orpc.automations.fields.key() });
        setOpen(false);
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button variant="ghost" size="sm" />}>
        <IconClipboard />
        {sample
          ? t('hook-sample-replace', 'Use another sample')
          : t('hook-sample-paste', 'Paste a sample instead')}
      </Dialog.Trigger>
      <Dialog.Content className="sm:max-w-xl">
        <Dialog.HeaderCombined
          title={t('hook-sample-title', 'A sample call')}
          description={t(
            'hook-sample-description',
            'What the other system sends. Its fields fill the lists in this automation.',
          )}
        />
        <div className="space-y-3">
          <Field label={t('hook-sample-body', 'Body')}>
            <JsonEditor
              label={t('hook-sample-body', 'Body')}
              value={body}
              fields={[]}
              subject="customer"
              plain
              rootKinds={['object', 'list']}
              onChange={setBody}
            />
          </Field>
          <Field label={t('hook-sample-query', 'Address query (optional)')}>
            <JsonEditor
              label={t('hook-sample-query', 'Address query (optional)')}
              value={query}
              fields={[]}
              subject="customer"
              plain
              flat
              onChange={setQuery}
            />
          </Field>
          {save.isError && <p className="text-sm text-destructive-text">{messageOf(save.error)}</p>}
          <div className="flex justify-end">
            <Button
              disabled={save.isPending}
              onClick={() =>
                save.mutate({
                  id: automationId,
                  body: z.json().safeParse(body).data ?? null,
                  query: z.record(z.string(), z.json()).safeParse(query).data ?? {},
                })
              }
            >
              {save.isPending ? <Spinner size="sm" /> : t('hook-sample-save', 'Use this sample')}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

export const HookSampleCall = ({ sample, on }: { sample: HookSample | null; on: boolean }) => {
  const { t } = useTranslation('automations');
  const { automationId } = useContext(BuilderContext);

  const keys = useAutomationFields(null, automationId)
    .fields.filter((field) => /^event\.payload\.(body|query)\./.test(field.path))
    .map((field) => field.label);

  return (
    <Field label={t('hook-sample', 'Sample call')}>
      <div className="space-y-2 rounded-md border border-dashed p-3">
        {sample ? (
          <p className="text-sm">
            {t('hook-sample-got', 'Got a call')}{' '}
            <RelativeDateDisplay value={sample.at}>
              <RelativeDateDisplay.Value value={sample.at} />
            </RelativeDateDisplay>
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm">
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-success" />
            {on
              ? t('hook-sample-on', 'It is on: calls start runs. Paste a sample to try changes.')
              : t(
                  'hook-sample-waiting',
                  'Waiting for a call to the address. Nothing runs while it is off.',
                )}
          </p>
        )}
        {keys.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {keys.map((key) => (
              <Badge key={key} variant="secondary">
                {key}
              </Badge>
            ))}
          </div>
        )}
        <PasteSample key={sample?.at} sample={sample} />
      </div>
    </Field>
  );
};
