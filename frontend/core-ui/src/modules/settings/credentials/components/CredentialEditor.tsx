import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Collapsible, Form, Input, Sheet, useToast } from 'erxes-ui';
import { useRef, useState, useEffect } from 'react';
import { CredentialMetadata, CredentialTemplate } from '../types';
import {
  credentialDefaults,
  credentialFormSchema,
  credentialInput,
  CredentialFormValues,
  newCustomField,
} from '../form';
import { CREDENTIALS_CREATE, CREDENTIALS_UPDATE } from '../graphql';
import { CredentialFields } from './CredentialFields';
import { useCredentialMutationClient } from '../useCredentialMutationClient';

export function CredentialEditor({
  credential,
  templates,
  onClose,
  onSaved,
}: {
  credential?: CredentialMetadata;
  templates: CredentialTemplate[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const client = useCredentialMutationClient();
  const { toast } = useToast();
  const [template, setTemplate] = useState(
    templates.find(({ id }) => id === credential?.templateId),
  );
  const [saving, setSaving] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const form = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialFormSchema),
    defaultValues: credentialDefaults(template, credential),
  });
  const close = () => {
    form.reset(credentialDefaults());
    onClose();
  };
  const choose = (next: CredentialTemplate) => {
    setTemplate(next);
    const defaults = credentialDefaults(next);
    if (next.id === 'generic' && !defaults.fields.length)
      defaults.fields.push(newCustomField());
    form.reset(defaults);
  };
  const submit = async (values: CredentialFormValues) => {
    if (saving) return;
    setSaving(true);
    try {
      // client.mutate avoids retaining plaintext variables in a useMutation result.
      await client.mutate({
        mutation: credential ? CREDENTIALS_UPDATE : CREDENTIALS_CREATE,
        variables: {
          ...(credential ? { _id: credential._id } : {}),
          input: credentialInput(values),
        },
        fetchPolicy: 'no-cache',
      });
      toast({
        title: credential ? 'Credential updated' : 'Credential added',
        variant: 'success',
      });
      onSaved();
      if (active.current) close();
    } catch {
      toast({
        title: 'Could not save credential',
        description: 'Check the fields and your permissions, then try again.',
        variant: 'destructive',
      });
    } finally {
      if (active.current) setSaving(false);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && close()}>
      <Sheet.View
        className="p-0 sm:max-w-lg"
        aria-describedby="credential-editor-description"
      >
        <Sheet.Header>
          <Sheet.Title>
            {credential ? 'Edit credential' : 'Add credential'}
          </Sheet.Title>
          <Sheet.Close aria-label="Close credential editor" />
        </Sheet.Header>
        {!template && !credential ? (
          <Sheet.Content className="overflow-y-auto p-5 space-y-4">
            <p
              id="credential-editor-description"
              className="text-sm text-muted-foreground"
            >
              Start with a template or add your own key-value pairs.
            </p>
            <div className="space-y-2">
              {templates.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-start whitespace-normal p-4 text-left"
                  onClick={() => choose(item)}
                >
                  <span>
                    <span className="block font-medium">{item.name}</span>
                    <span className="block text-xs text-muted-foreground mt-1">
                      {item.description || item.category}
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          </Sheet.Content>
        ) : (
          <Form {...form}>
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={form.handleSubmit(submit, (errors) => {
                if (errors.description || errors.category) setDetailsOpen(true);
              })}
              autoComplete="off"
            >
              <Sheet.Content className="overflow-y-auto p-5 space-y-4">
                <p
                  id="credential-editor-description"
                  className="text-sm text-muted-foreground"
                >
                  {template?.name || credential?.templateId}
                </p>
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Name</Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          placeholder="Give this credential a name"
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <CredentialFields
                  generic={form.watch('templateId') === 'generic'}
                  descriptors={credential?.fields || template?.fields || []}
                />
                <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                  <Collapsible.Trigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-0 text-muted-foreground"
                    >
                      <Collapsible.TriggerIcon />
                      Description & category
                    </Button>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="space-y-4 pt-3">
                    <Form.Field
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Description (optional)</Form.Label>
                          <Form.Control>
                            <Input {...field} />
                          </Form.Control>
                          <Form.Description>
                            Keep secrets in the values above, not in the name or
                            description.
                          </Form.Description>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Category</Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              disabled={form.watch('templateId') !== 'generic'}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    {credential && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Stable reference
                        </p>
                        <p className="break-all font-mono text-xs">
                          {credential.reference}
                        </p>
                      </div>
                    )}
                  </Collapsible.Content>
                </Collapsible>
              </Sheet.Content>
              <Sheet.Footer>
                <Button type="button" variant="secondary" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save credential'}
                </Button>
              </Sheet.Footer>
            </form>
          </Form>
        )}
      </Sheet.View>
    </Sheet>
  );
}
