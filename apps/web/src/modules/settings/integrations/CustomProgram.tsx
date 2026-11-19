import type { Integration as CustomRecord, IntegrationProgram } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconArrowLeft } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Badge, Button, CopyText, Spinner, useConfirm, useFormat, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useIntegrationsSaved } from './customMutation';
import { CustomProgramTest } from './CustomProgramTest';
import { CustomProgramVersions } from './CustomProgramVersions';
import { OverviewSection } from './IntegrationLayout';

export const programTypes = (record: CustomRecord, program: IntegrationProgram) =>
  program.kind === 'action'
    ? [`integrations.${record.key}.${program.key}`]
    : program.events.map((event) => `integrations.${record.key}.${event.key}`);

export const KindBadge = ({ kind }: { kind: IntegrationProgram['kind'] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });

  return (
    <Badge variant={kind === 'action' ? 'info' : 'default'}>
      {kind === 'action' ? t('kind-action', 'Action') : t('kind-incoming', 'Incoming')}
    </Badge>
  );
};

type DataField = { key: string; label: string; type: string; required?: boolean };

const Fields = ({ title, fields }: { title: string; fields: DataField[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });

  return (
    <OverviewSection title={title}>
      {fields.length ? (
        <ul className="divide-y rounded-lg border text-sm">
          {fields.map((field) => (
            <li key={field.key} className="flex flex-wrap items-center gap-2 px-3 py-2">
              <span className="font-medium">{field.label}</span>
              <code className="font-mono text-xs text-muted-foreground">{field.key}</code>
              <span className="ml-auto text-xs text-muted-foreground">
                {field.required
                  ? t('required-type', '{{type}}, required', { type: field.type })
                  : field.type}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t('none', 'None')}</p>
      )}
    </OverviewSection>
  );
};

const Copyable = ({ value }: { value: string }) => (
  <CopyText value={value} className="max-w-full">
    <code className="font-mono text-xs break-all">{value}</code>
  </CopyText>
);

const ProgramDetails = ({
  record,
  program,
}: {
  record: CustomRecord;
  program: IntegrationProgram;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });

  if (program.kind === 'action') {
    return (
      <>
        <OverviewSection title={t('type', 'Type')}>
          <Copyable value={`integrations.${record.key}.${program.key}`} />
        </OverviewSection>
        <Fields title={t('fields', 'Fields')} fields={program.fields} />
        <Fields title={t('outputs', 'Outputs')} fields={program.outputs} />
      </>
    );
  }

  return (
    <>
      <OverviewSection title={t('address', 'Address')}>
        {program.address && <Copyable value={program.address} />}
        <p className="text-xs text-muted-foreground">
          {t('address-hint', 'Give this address to the service. Its calls run this program.')}
        </p>
      </OverviewSection>
      {program.events.map((event) => (
        <Fields
          key={event.key}
          title={t('event', 'Event: {{label}} ({{type}})', {
            label: event.label,
            type: `integrations.${record.key}.${event.key}`,
          })}
          fields={event.fields}
        />
      ))}
    </>
  );
};

const RemoveProgram = ({
  program,
  onRemoved,
}: {
  program: IntegrationProgram;
  onRemoved: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const remove = useMutation(
    orpc.integrations.removeProgram.mutationOptions(
      useIntegrationsSaved(
        t('program-remove-failed', 'Could not delete the program'),
        () => {
          toast({ title: t('program-removed', 'Program deleted') });
          onRemoved();
        },
        orpc.integrations.get.key(),
      ),
    ),
  );

  const message = t(
    'program-remove-description',
    'Its versions go too. Automations that use it will fail.',
  );

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-lg border border-destructive/30 p-4">
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-sm font-medium">{t('program-remove-title', 'Delete this program')}</h3>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      <Button
        variant="destructive"
        disabled={remove.isPending}
        onClick={() =>
          void confirm({
            message: t('remove-confirm', 'Delete {{name}}?', { name: program.label }),
            options: { description: message },
          }).then(() => remove.mutate({ id: program.id }))
        }
      >
        {remove.isPending ? <Spinner size="sm" /> : t('remove', 'Delete')}
      </Button>
    </section>
  );
};

export const CustomProgram = ({
  record,
  program,
  onClose,
}: {
  record: CustomRecord;
  program: IntegrationProgram;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const fmt = useFormat();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <IconArrowLeft />
          {t('all-programs', 'All programs')}
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold">{program.label}</h2>
          <KindBadge kind={program.kind} />
        </div>
        {program.description && (
          <p className="text-sm text-muted-foreground">{program.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('version-updated', 'Version {{version}}, saved {{when}}', {
            version: program.version,
            when: fmt.relative(program.updatedAt),
          })}
        </p>
      </div>
      <ProgramDetails record={record} program={program} />
      <OverviewSection title={t('code', 'Code')}>
        <pre className="max-h-96 overflow-auto rounded-lg border bg-muted p-3 font-mono text-xs">
          {program.code}
        </pre>
        <p className="text-xs text-muted-foreground">
          {t('code-hint', 'The assistant writes and changes the code. Ask it for a change.')}
        </p>
      </OverviewSection>
      <CustomProgramTest key={program.id} program={program} />
      <CustomProgramVersions program={program} />
      <RemoveProgram program={program} onRemoved={onClose} />
    </div>
  );
};
