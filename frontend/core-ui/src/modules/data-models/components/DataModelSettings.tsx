import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronRight, IconPhoto } from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  Form,
  IconPicker,
  Input,
  Select,
  Textarea,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePermissionCheck } from 'ui-modules';
import { z } from 'zod';
import { dataModelErrorMessage } from '../errorMessage';
import { DATA_MODEL_UPDATE } from '../graphql';
import { useDataModelFields, useDataModelMutation } from '../hooks';
import type { DataModel } from '../types';
import { DataModelError } from './DataModelFeedback';
import { DataModelIcon } from './DataModelVisuals';

const settingsSchema = z.object({
  labelSingular: z.string().trim().min(1, 'Enter a singular name.').max(100),
  labelPlural: z.string().trim().min(1, 'Enter a plural name.').max(100),
  description: z.string().trim().max(2000),
  icon: z.string().regex(/^Icon[A-Za-z0-9]{1,60}$/),
  recordLabelField: z.string(),
  recordImageField: z.string(),
});
type SettingsValues = z.infer<typeof settingsSchema>;
const settingKeys = [
  'labelSingular',
  'labelPlural',
  'description',
  'icon',
  'recordLabelField',
  'recordImageField',
] as const;
const settingsValues = (model: DataModel): SettingsValues => ({
  labelSingular: model.labelSingular,
  labelPlural: model.labelPlural,
  description: model.description,
  icon: model.icon,
  recordLabelField: model.recordLabelField ?? '',
  recordImageField: model.recordImageField ?? '',
});

export const DataModelSettings = ({
  model,
  onReload,
  onArchive,
}: {
  model: DataModel;
  onReload: () => Promise<DataModel>;
  onArchive: () => void;
}) => {
  const { hasActionPermission } = usePermissionCheck();
  const manage = hasActionPermission('dataModelsManage');
  const custom = model.source === 'CUSTOM';
  const [snapshot, setSnapshot] = useState(model);
  const [reloading, setReloading] = useState(false);
  const [reloadError, setReloadError] = useState<Error | null>(null);
  const fields = useDataModelFields(model._id);
  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settingsValues(model),
  });
  const [save, { loading, error, reset: resetMutation }] = useDataModelMutation(
    DATA_MODEL_UPDATE,
    'Object settings saved',
  );
  const dirty = form.formState.isDirty;
  useEffect(() => {
    if (!dirty && !loading && model.version > snapshot.version) {
      setSnapshot(model);
      form.reset(settingsValues(model));
    }
  }, [dirty, loading, model, snapshot.version, form]);
  const values = form.watch();
  const available = custom
    ? fields.fields
        .filter((field) => !field.archivedAt)
        .map((field) => ({
          id: field._id,
          label: field.label,
          type: field.type,
        }))
    : model.systemFields.map((field) => ({
        id: field.code,
        label: field.name,
        type: field.type,
      }));
  const labels = available.filter((field) =>
    ['text', 'phone', 'textarea'].includes(field.type),
  );
  const images = available.filter(
    (field) => field.type === (custom ? 'text' : 'file'),
  );
  const selectedLabel = labels.find(
    (field) => field.id === values.recordLabelField,
  );
  const selectedImage = images.find(
    (field) => field.id === values.recordImageField,
  );
  const disabled = !manage || loading || reloading;
  const resetLatest = async () => {
    setReloading(true);
    setReloadError(null);
    try {
      const latest = await onReload();
      setSnapshot(latest);
      form.reset(settingsValues(latest));
      resetMutation();
    } catch (reason: unknown) {
      setReloadError(
        reason instanceof Error
          ? reason
          : new Error('Unable to reload settings.'),
      );
    } finally {
      setReloading(false);
    }
  };
  const submit = form.handleSubmit(async (next) => {
    const input = Object.fromEntries(
      settingKeys
        .filter((key) => form.formState.dirtyFields[key])
        .map((key) => [
          key,
          key === 'recordLabelField' || key === 'recordImageField'
            ? next[key] || null
            : next[key],
        ]),
    );
    if (!Object.keys(input).length) return;
    try {
      const result = await save({
        variables: { _id: model._id, expectedVersion: snapshot.version, input },
      });
      const updated = result.data?.dataModelUpdate;
      if (updated && 'labelSingular' in updated) {
        setSnapshot(updated);
        form.reset(settingsValues(updated));
      }
    } catch {
      // Keep the opening version and edits until the user chooses to reload.
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} className="space-y-10">
        <section aria-labelledby="model-about" className="space-y-4">
          <div>
            <h2 id="model-about" className="text-sm font-medium">
              About
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how this object appears in Data Models.
            </p>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-start gap-2 sm:grid-cols-[auto_1fr_1fr]">
            <Form.Field
              control={form.control}
              name="icon"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Icon</Form.Label>
                  <Form.Control>
                    <IconPicker
                      key={field.value}
                      value={field.value}
                      onValueChange={(icon) =>
                        field.onChange(icon ?? 'IconDatabase')
                      }
                      disabled={disabled}
                      aria-label="Object icon"
                      className="size-8 border bg-muted/40"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            {(['labelSingular', 'labelPlural'] as const).map((name) => (
              <Form.Field
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <Form.Item
                    className={
                      name === 'labelPlural'
                        ? 'col-start-2 sm:col-start-auto'
                        : ''
                    }
                  >
                    <Form.Label>
                      {name === 'labelSingular' ? 'Singular' : 'Plural'}
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} disabled={disabled} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            ))}
          </div>
          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Description</Form.Label>
                <Form.Control>
                  <Textarea
                    {...field}
                    disabled={disabled}
                    placeholder="Describe the records your team keeps here."
                    className="min-h-24 resize-y"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </section>

        <section aria-labelledby="model-record-display" className="space-y-4">
          <div>
            <h2 id="model-record-display" className="text-sm font-medium">
              Record display
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how people recognize records in relation pickers.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border bg-muted/20">
            <div className="space-y-4 px-4 py-4">
              <p className="text-xs text-muted-foreground">
                Preview · field names
              </p>
              <div className="flex items-center gap-2 text-sm">
                <DataModelIcon name={model.name} icon={values.icon} />
                <span className="flex-1 font-medium">
                  {values.labelSingular || model.labelSingular}
                </span>
                <span className="text-xs text-muted-foreground">
                  {custom ? 'Custom' : 'Built-in'}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2.5 text-sm">
                {selectedImage && (
                  <IconPhoto
                    className="size-4 text-muted-foreground"
                    aria-label={`Image from ${selectedImage.label}`}
                  />
                )}
                <span className="truncate text-muted-foreground">
                  {selectedLabel?.label ??
                    (values.recordLabelField
                      ? 'Unavailable label field'
                      : 'Automatic record label')}
                </span>
                {selectedImage && (
                  <span className="ml-auto truncate text-xs text-muted-foreground">
                    {selectedImage.label}
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-4 border-t bg-muted/20 p-4 sm:grid-cols-2">
              {(['recordLabelField', 'recordImageField'] as const).map(
                (name) => {
                  const choices = name === 'recordLabelField' ? labels : images;
                  return (
                    <Form.Field
                      key={name}
                      control={form.control}
                      name={name}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>
                            {name === 'recordLabelField'
                              ? 'Record label'
                              : 'Record image'}
                          </Form.Label>
                          <Select
                            value={
                              field.value ? `field:${field.value}` : 'default'
                            }
                            onValueChange={(value) =>
                              field.onChange(
                                value === 'default' ? '' : value.slice(6),
                              )
                            }
                            disabled={
                              disabled ||
                              (custom &&
                                (fields.loading || Boolean(fields.error)))
                            }
                          >
                            <Form.Control>
                              <Select.Trigger>
                                <Select.Value />
                              </Select.Trigger>
                            </Form.Control>
                            <Select.Content>
                              <Select.Item value="default">
                                {name === 'recordLabelField'
                                  ? 'Automatic'
                                  : 'No image'}
                              </Select.Item>
                              {field.value &&
                                !choices.some(
                                  (choice) => choice.id === field.value,
                                ) && (
                                  <Select.Item
                                    value={`field:${field.value}`}
                                    disabled
                                  >
                                    Unavailable field
                                  </Select.Item>
                                )}
                              {choices.map((choice) => (
                                <Select.Item
                                  key={choice.id}
                                  value={`field:${choice.id}`}
                                >
                                  {choice.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  );
                },
              )}
            </div>
          </div>
          {custom && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              For images, choose a text field that contains an image URL. If a
              label is empty or its field is archived, the record ID is used.
            </p>
          )}
          {custom && fields.loading && (
            <p role="status" className="text-xs text-muted-foreground">
              Loading available fields…
            </p>
          )}
          {custom && fields.error && (
            <DataModelError error={fields.error} onRetry={fields.retry} />
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">Advanced</h2>
          <Collapsible className="rounded-md border">
            <Collapsible.Trigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full justify-between px-3 font-normal"
              >
                API identity
                <IconChevronRight className="size-4" />
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content className="space-y-2 border-t px-3 py-3">
              <p className="font-mono text-xs">{model.name}</p>
              <p className="text-xs text-muted-foreground">
                This permanent name keeps integrations working when you rename
                the object.
              </p>
            </Collapsible.Content>
          </Collapsible>
        </section>

        {(error || reloadError) && (
          <div role="alert" className="space-y-2 text-sm text-destructive">
            <p>
              {reloadError
                ? reloadError.message
                : /model changed/i.test(error?.message ?? '')
                ? 'This object changed while you were editing it. Your edits are kept. Reload latest to load the saved settings before trying again.'
                : dataModelErrorMessage(error ?? 'Unable to save settings.')}
            </p>
          </div>
        )}
        {manage && (
          <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t bg-background py-3">
            <span className="text-xs text-muted-foreground" role="status">
              {dirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
            <div className="flex gap-2">
              {(dirty || error || reloadError) && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading || reloading}
                  onClick={() => {
                    void resetLatest();
                  }}
                >
                  {reloading ? 'Reloading…' : 'Reload latest'}
                </Button>
              )}
              <Button type="submit" disabled={disabled || !dirty}>
                {loading ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        )}
        {custom && manage && (
          <section className="space-y-3 border-t pt-6">
            <h2 className="text-sm font-medium">Archive object</h2>
            <p className="text-sm text-muted-foreground">
              Hide this object and pause access to its records. Its fields and
              records are kept.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onArchive}
              disabled={loading || reloading || dirty}
            >
              Archive object
            </Button>
            {dirty && (
              <p className="text-xs text-muted-foreground">
                Save or reload your changes before archiving.
              </p>
            )}
          </section>
        )}
        {!custom && (
          <p className="border-t pt-4 text-xs leading-relaxed text-muted-foreground">
            Display settings can change. The object’s API identity and system
            fields are protected, and this object cannot be archived.
          </p>
        )}
      </form>
    </Form>
  );
};
