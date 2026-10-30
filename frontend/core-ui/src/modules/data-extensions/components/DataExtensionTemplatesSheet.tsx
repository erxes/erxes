import { useApolloClient, useMutation } from '@apollo/client';
import { IconDownload, IconFileImport, IconTemplate } from '@tabler/icons-react';
import { Button, Checkbox, Label, Sheet, Spinner, Tabs, toast } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DATA_EXTENSION_FIELDS,
  IDataExtensionField,
  useDataExtensionRecordTypes,
} from 'ui-modules';
import { DATA_EXTENSION_FIELD_ADD, DATA_EXTENSION_RELATION_ADD } from '../graphql/mutations';
import { DATA_EXTENSION_OBJECT_ADD } from '../graphql/objects';
import { useDataExtensionObjects } from '../hooks/useDataExtensionObjects';
import { TEMPLATE_PACKS, packTemplate } from '../utils/templatePacks';
import {
  applyDataModelTemplate,
  buildDataModelTemplate,
  IDataModelTemplate,
  ITemplateResult,
  readDataModelTemplate,
} from '../utils/templates';
import { DataExtensionObjectIcon } from './DataExtensionObjectIcon';

const refetchQueries = ['DataExtensionObjects', 'DataExtensionRecordTypes', 'DataExtensionFields'];

/**
 * Ready data models for common businesses, plus export and import of any
 * workspace's model as JSON. Applying uses the same mutations as the
 * builder, so every rule applies and existing items are skipped.
 */
export const DataExtensionTemplatesSheet = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t, i18n } = useTranslation('dataExtensions');
  const client = useApolloClient();
  const { recordTypes } = useDataExtensionRecordTypes();
  const { objects } = useDataExtensionObjects();
  const [addObject] = useMutation(DATA_EXTENSION_OBJECT_ADD);
  const [addField] = useMutation(DATA_EXTENSION_FIELD_ADD);
  const [addRelation] = useMutation(DATA_EXTENSION_RELATION_ADD);
  const [selected, setSelected] = useState<string[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<ITemplateResult | null>(null);
  const [imported, setImported] = useState<IDataModelTemplate | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const apply = async (id: string, template: IDataModelTemplate) => {
    setRunning(id);
    setResult(null);

    const outcome = await applyDataModelTemplate(
      template,
      {
        addObject: (input) => addObject({ variables: { input } }),
        addField: (input) => addField({ variables: { input } }),
        addRelation: (input) => addRelation({ variables: { input } }),
      },
      setResult,
    );

    await client.refetchQueries({ include: refetchQueries });
    setRunning(null);
    toast({
      variant: outcome.failed.length ? 'destructive' : 'success',
      title: t('templates.applied', {
        created: outcome.created.length,
        skipped: outcome.skipped.length,
      }),
    });
  };

  const exportModel = async () => {
    const { data } = await client.query<{ dataExtensionFields: IDataExtensionField[] }>({
      query: DATA_EXTENSION_FIELDS,
      variables: {},
      fetchPolicy: 'network-only',
    });
    const template = buildDataModelTemplate(selected, objects, data.dataExtensionFields);
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');

    link.href = url;
    link.download = 'data-model.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !running && onOpenChange(next)}>
      <Sheet.View className="p-0 sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title className="flex items-center gap-2">
            <IconTemplate />
            {t('templates.title')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col gap-4 overflow-y-auto p-5">
          <Tabs defaultValue="packs" className="flex flex-col gap-4">
            <Tabs.List className="w-fit">
              <Tabs.Trigger value="packs">{t('templates.packs')}</Tabs.Trigger>
              <Tabs.Trigger value="export">{t('templates.export')}</Tabs.Trigger>
              <Tabs.Trigger value="import">{t('templates.import')}</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="packs" className="flex flex-col gap-3">
              {TEMPLATE_PACKS.map((pack) => {
                const lang = i18n.language.startsWith('mn') ? 'mn' : 'en';

                return (
                  <article key={pack.id} className="flex items-start gap-3 rounded-md border p-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <DataExtensionObjectIcon icon={pack.icon} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="text-sm font-medium">{pack.name[lang]}</h3>
                      <p className="text-sm text-muted-foreground">{pack.description[lang]}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('templates.contents', {
                          objects: pack.objects.length,
                          fields: pack.fields.length + pack.relations.length,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      disabled={Boolean(running)}
                      onClick={() => apply(pack.id, packTemplate(pack, i18n.language))}
                    >
                      {running === pack.id && <Spinner size="sm" />}
                      {t('templates.apply')}
                    </Button>
                  </article>
                );
              })}
            </Tabs.Content>

            <Tabs.Content value="export" className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">{t('templates.export-hint')}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {recordTypes
                  .filter((recordType) => recordType.custom || recordType.fieldCount)
                  .map((recordType) => (
                    <div key={recordType.recordType} className="flex items-center gap-2">
                      <Checkbox
                        id={`template-${recordType.recordType}`}
                        checked={selected.includes(recordType.recordType)}
                        onCheckedChange={(checked) =>
                          setSelected((current) =>
                            checked
                              ? [...current, recordType.recordType]
                              : current.filter((value) => value !== recordType.recordType),
                          )
                        }
                      />
                      <Label
                        htmlFor={`template-${recordType.recordType}`}
                        className="font-normal normal-case tracking-normal"
                      >
                        {t(`record-types.${recordType.recordType}`, recordType.label)}
                      </Label>
                    </div>
                  ))}
              </div>
              <Button className="self-start" disabled={!selected.length} onClick={exportModel}>
                <IconDownload />
                {t('templates.download')}
              </Button>
            </Tabs.Content>

            <Tabs.Content value="import" className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">{t('templates.import-hint')}</p>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                tabIndex={-1}
                onChange={async (event) => {
                  const file = event.target.files?.[0];

                  event.target.value = '';

                  if (!file) {
                    return;
                  }

                  try {
                    setImported(readDataModelTemplate(await file.text()));
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: t('templates.bad-file'),
                      description: error instanceof Error ? error.message : undefined,
                    });
                  }
                }}
              />
              <Button variant="outline" className="self-start" onClick={() => fileRef.current?.click()}>
                <IconFileImport />
                {t('templates.choose-file')}
              </Button>
              {imported && (
                <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <p className="text-sm">
                    {t('templates.file-contents', {
                      objects: imported.objects.length,
                      fields: imported.fields.length,
                      relations: imported.relations.length,
                    })}
                  </p>
                  <Button disabled={Boolean(running)} onClick={() => apply('import', imported)}>
                    {running === 'import' && <Spinner size="sm" />}
                    {t('templates.apply')}
                  </Button>
                </div>
              )}
            </Tabs.Content>
          </Tabs>

          {result && (
            <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-3 text-sm" aria-live="polite">
              <p>
                {t('templates.progress', {
                  created: result.created.length,
                  skipped: result.skipped.length,
                  failed: result.failed.length,
                })}
              </p>
              {result.failed.map((failure) => (
                <p key={failure.item} className="text-xs text-destructive">
                  {failure.item}: {failure.error}
                </p>
              ))}
            </div>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
