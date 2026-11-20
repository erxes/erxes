import type {
  Integration as CustomRecord,
  IntegrationDetail,
  IntegrationProgram,
} from '@erxes/core-contract';
import { INTEGRATION_NAMESPACE } from '@erxes/core-contract/integrationValues';
import { IconChevronRight, IconCode, IconSparkles } from '@tabler/icons-react';
import { Button, Empty, useFormat } from 'erxes-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { useAskAssistant } from '~/modules/assistant/useAskAssistant';
import { CustomProgram, KindBadge, programTypes } from './CustomProgram';

const useAskForProgram = (record: CustomRecord) => {
  const ask = useAskAssistant();

  return ask
    ? () =>
        ask(
          `Add an action to the ${record.name} integration (${INTEGRATION_NAMESPACE}.${record.key}).`,
        )
    : null;
};

const AskButton = ({ onAsk }: { onAsk: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });

  return (
    <Button variant="outline" className="shrink-0" onClick={onAsk}>
      <IconSparkles />
      {t('ask-assistant', 'Ask the assistant')}
    </Button>
  );
};

const NoPrograms = ({ record }: { record: CustomRecord }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const ask = useAskForProgram(record);

  return (
    <Empty variant="outline">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconCode />
        </Empty.Media>
        <Empty.Title>{t('programs-empty', 'No programs yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'programs-empty-description',
            'Ask the assistant to add an action. It writes the code; you test it here.',
          )}
        </Empty.Description>
      </Empty.Header>
      {ask && (
        <Empty.Content>
          <AskButton onAsk={ask} />
        </Empty.Content>
      )}
    </Empty>
  );
};

const ProgramRow = ({
  record,
  program,
  onOpen,
}: {
  record: CustomRecord;
  program: IntegrationProgram;
  onOpen: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const fmt = useFormat();

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="min-w-0 flex-1 space-y-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{program.label}</span>
            <KindBadge kind={program.kind} />
          </span>
          <span className="block truncate font-mono text-xs text-muted-foreground">
            {programTypes(record, program).join(', ') || t('no-events', 'No events')}
          </span>
        </span>
        <span className="shrink-0 text-right text-xs text-muted-foreground">
          <span className="block">
            {t('version', 'Version {{version}}', { version: program.version })}
          </span>
          <span className="block">{fmt.relative(program.updatedAt)}</span>
        </span>
        <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>
    </li>
  );
};

export const CustomPrograms = ({ record }: { record: IntegrationDetail }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { programs } = record;
  const [programId, setProgramId] = useQueryState('program', parseAsString);
  const ask = useAskForProgram(record);
  const open = programs.find((program) => program.id === programId);

  if (open) {
    return <CustomProgram record={record} program={open} onClose={() => void setProgramId(null)} />;
  }

  if (!programs.length) return <NoPrograms record={record} />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 basis-64 text-sm text-muted-foreground">
          {t(
            'programs-intro',
            'The assistant writes these. Actions are automation steps; incoming programs start automations from the service.',
          )}
        </p>
        {ask && <AskButton onAsk={ask} />}
      </div>
      <ul className="divide-y rounded-lg border">
        {programs.map((program) => (
          <ProgramRow
            key={program.id}
            record={record}
            program={program}
            onOpen={() => void setProgramId(program.id)}
          />
        ))}
      </ul>
    </div>
  );
};
