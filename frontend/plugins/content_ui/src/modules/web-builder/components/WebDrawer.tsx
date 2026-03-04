import {
  Button,
  Combobox,
  Command,
  Form,
  Input,
  Popover,
  Sheet,
  Textarea,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAtom } from 'jotai';
import { webDrawerState } from '../states/webBuilderState';
import { useCreateWeb } from '../hooks/useCreateWeb';
import { useEditWeb } from '../hooks/useEditWeb';
import { useGetClientPortals } from '../hooks/useGetClientPortals';
import { IWebInput } from '../types';
import { TEMPLATE_TYPES } from '../constants';
import { TemplateSelect } from './TemplateSelect';

interface SelectOption {
  value: string;
  label: string;
}

const FormComboSelect = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const label = options.find((o) => o.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className="w-full shadow-xs">
          <span className={label ? '' : 'text-muted-foreground'}>
            {label || placeholder}
          </span>
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command>
          <Command.List>
            {options.map((opt) => (
              <Command.Item
                key={opt.value}
                value={opt.value}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
                <Combobox.Check checked={value === opt.value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const WebDrawer = () => {
  const [drawer, setDrawer] = useAtom(webDrawerState);
  const { createWeb, loading: creating } = useCreateWeb();
  const { editWeb, loading: updating } = useEditWeb();
  const { portals } = useGetClientPortals();

  const isEditing = !!drawer.editingWeb;
  const form = useForm<IWebInput>({
    defaultValues: {
      name: '',
      description: '',
      domain: '',
      templateType: '',
      templateId: '',
      clientPortalId: '',
    },
  });

  useEffect(() => {
    if (drawer.open) {
      form.reset({
        name: drawer.editingWeb?.name || '',
        description: drawer.editingWeb?.description || '',
        domain: drawer.editingWeb?.domain || '',
        templateType: drawer.editingWeb?.templateType || '',
        templateId: drawer.editingWeb?.templateId || '',
        clientPortalId: drawer.editingWeb?.clientPortalId || '',
      });
    }
  }, [drawer.open, drawer.editingWeb, form]);

  const onClose = () => setDrawer({ open: false, editingWeb: null });

  const onSubmit = async (data: IWebInput) => {
    if (isEditing && drawer.editingWeb) {
      await editWeb({ variables: { id: drawer.editingWeb._id, doc: data } });
    } else {
      await createWeb({ variables: { doc: data } });
    }
    onClose();
  };

  const selectedType = form.watch('templateType');

  const portalOptions: SelectOption[] = portals.map((p) => ({
    value: p._id,
    label: p.name,
  }));

  return (
    <Sheet open={drawer.open} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0 flex flex-col">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>
            {isEditing ? 'Edit Web Project' : 'New Web Project'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Name</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="My Website" required />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="clientPortalId"
                rules={{ required: 'Client portal is required' }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Client Portal <span className="text-destructive">*</span></Form.Label>
                    <FormComboSelect
                      options={portalOptions}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Select a client portal"
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Description</Form.Label>
                    <Form.Control>
                      <Textarea
                        {...field}
                        placeholder="Optional description"
                        rows={3}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Domain</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="example.com" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="templateType"
                rules={{ required: 'Template type is required' }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Template Type <span className="text-destructive">*</span></Form.Label>
                    <FormComboSelect
                      options={TEMPLATE_TYPES}
                      value={field.value || ''}
                      onChange={(v) => {
                        field.onChange(v);
                        form.setValue('templateId', '');
                      }}
                      placeholder="Select a template type"
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="templateId"
                rules={{ required: 'Template is required' }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Template <span className="text-destructive">*</span></Form.Label>
                    <TemplateSelect
                      type={selectedType || ''}
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {creating || updating
                  ? isEditing
                    ? 'Saving...'
                    : 'Creating...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
