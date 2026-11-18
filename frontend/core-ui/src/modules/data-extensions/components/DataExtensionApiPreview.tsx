import { IconCode, IconCopy } from '@tabler/icons-react';
import { CopyText, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  buildApiExamples,
  IDataExtensionRecordType,
  useDataExtensionFields,
  useDataExtensionRecordTypes,
} from 'ui-modules';
import { DataExtensionEmptyState } from './DataExtensionStates';

const CodeBlock = ({
  title,
  code,
  copyLabel,
}: {
  title: string;
  code: string;
  copyLabel: string;
}) => (
  <section className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium">{title}</h3>
      <CopyText
        value={code}
        className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <IconCopy className="size-4" />
        {copyLabel}
      </CopyText>
    </div>
    <pre className="overflow-x-auto rounded-md border bg-muted/50 p-4 text-xs leading-relaxed">
      <code>{code}</code>
    </pre>
  </section>
);

export const DataExtensionApiPreview = ({
  recordType,
}: {
  recordType: IDataExtensionRecordType;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { fields, loading } = useDataExtensionFields({
    recordType: recordType.recordType,
  });
  const { recordTypes } = useDataExtensionRecordTypes();

  if (loading && !fields.length) {
    return <Spinner />;
  }

  if (!fields.length) {
    return (
      <DataExtensionEmptyState
        icon={<IconCode />}
        title={t('empty.api-title')}
        description={t('empty.api-description')}
      />
    );
  }

  const { endpoint, query, mutation } = buildApiExamples(
    recordType,
    fields,
    recordTypes,
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-5">
        <section className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">{t('api.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('api.description')}
          </p>
        </section>
        <CodeBlock
          title={t('api.endpoint')}
          code={`POST ${endpoint}`}
          copyLabel={t('api.copy')}
        />
        <CodeBlock
          title={t('api.read')}
          code={query}
          copyLabel={t('api.copy')}
        />
        {mutation && (
          <CodeBlock
            title={t('api.write')}
            code={mutation}
            copyLabel={t('api.copy')}
          />
        )}
        <p className="text-xs text-muted-foreground">{t('api.null-hint')}</p>
      </div>
    </div>
  );
};
