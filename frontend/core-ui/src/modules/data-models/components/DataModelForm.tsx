import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronRight } from '@tabler/icons-react';
import { Button, Collapsible, Form, Input, Sheet, Textarea } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { DATA_MODEL_CREATE, DATA_MODEL_UPDATE } from '../graphql';
import { useDataModelMutation } from '../hooks';
import { modelPath, type DataModel } from '../types';
import { dataModelFormSchema, modelApiName } from '../validation';
import { dataModelErrorMessage } from '../errorMessage';
import { useDataModelEditorClose } from '../useDataModelEditorClose';

export const DataModelForm = ({
  model,
  onClose,
}: {
  model?: DataModel;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const form = useForm<z.infer<typeof dataModelFormSchema>>({
    resolver: zodResolver(dataModelFormSchema),
    defaultValues: {
      name: model?.name ?? '',
      labelSingular: model?.labelSingular ?? '',
      labelPlural: model?.labelPlural ?? '',
      description: model?.description ?? '',
    },
  });
  const label = form.watch('labelSingular');
  useEffect(() => {
    if (!model && !form.getFieldState('name').isDirty)
      form.setValue('name', modelApiName(label));
  }, [form, label, model]);
  const [save, { loading, error }] = useDataModelMutation(
    model ? DATA_MODEL_UPDATE : DATA_MODEL_CREATE,
    model ? 'Model updated' : 'Model created',
  );
  const close = useDataModelEditorClose({
    dirty: form.formState.isDirty,
    loading,
    onClose,
  });

  const submit = form.handleSubmit(async ({ name, ...presentation }) => {
    try {
      const result = await save({
        variables: model
          ? {
              _id: model._id,
              expectedVersion: model.version,
              input: presentation,
            }
          : { input: { name, ...presentation } },
      });
      if (!result.data) return;
      const created = result.data?.dataModelCreate;
      onClose();
      if (created) navigate(modelPath(created._id));
    } catch {
      /* Apollo reports the error inline and through the shared toast. */
    }
  });

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) void close();
      }}
    >
      <Sheet.View className="p-0">
        <Form {...form}>
          <form className="flex h-full flex-col" onSubmit={submit}>
            <Sheet.Header>
              <Sheet.Title>
                {model ? 'Edit model' : 'New data model'}
              </Sheet.Title>
              <Sheet.Description className="sr-only">
                Choose a name for the records you want to keep.
              </Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="space-y-5 overflow-y-auto px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Create an object for the records your team needs to keep.
              </p>
              {!model && (
                <section
                  className="space-y-3 rounded-md bg-muted/40 p-4"
                  aria-label="Object suggestions"
                >
                  <h3 className="text-sm font-medium">
                    What would you like to track?
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Vehicle', 'Asset', 'Location', 'Contract'].map(
                      (label) => (
                        <Button
                          key={label}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={loading}
                          onClick={() => {
                            form.setValue('labelSingular', label, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                            form.setValue('labelPlural', `${label}s`, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        >
                          {label}s
                        </Button>
                      ),
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    These fill in the names only. Add the fields your team needs
                    after creating the object.
                  </p>
                </section>
              )}
              {(['labelSingular', 'labelPlural'] as const).map((name) => (
                <Form.Field
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>
                        {
                          {
                            labelSingular: 'Name for one record',
                            labelPlural: 'Name for a list',
                          }[name]
                        }
                      </Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          disabled={loading}
                          placeholder={
                            name === 'labelSingular'
                              ? 'e.g. Vehicle'
                              : 'e.g. Vehicles'
                          }
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              ))}
              <Collapsible
                open={
                  advancedOpen ||
                  Boolean(
                    form.formState.errors.name ||
                      form.formState.errors.description,
                  )
                }
                onOpenChange={setAdvancedOpen}
                className="space-y-4 border-t pt-3"
              >
                <Collapsible.Trigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="-ml-2 font-normal text-muted-foreground"
                  >
                    <IconChevronRight
                      className={`size-3.5 transition-transform ${
                        advancedOpen ? 'rotate-90' : ''
                      }`}
                    />
                    More settings
                  </Button>
                </Collapsible.Trigger>
                <Collapsible.Content className="space-y-4">
                  <Form.Field
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Description (optional)</Form.Label>
                        <Form.Control>
                          <Textarea
                            {...field}
                            disabled={loading}
                            placeholder="Help your team understand this object."
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>API name</Form.Label>
                        {model ? (
                          <p className="font-mono text-xs">{field.value}</p>
                        ) : (
                          <Form.Control>
                            <Input {...field} disabled={loading} />
                          </Form.Control>
                        )}
                        <Form.Description>
                          Generated automatically for integrations.
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </Collapsible.Content>
              </Collapsible>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {dataModelErrorMessage(error)}
                </p>
              )}
            </Sheet.Content>
            <Sheet.Footer>
              <Button
                variant="secondary"
                type="button"
                disabled={loading}
                onClick={() => {
                  void close();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : model ? 'Save changes' : 'Create model'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
