import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Input,
  Sheet,
  Spinner,
  Textarea,
  useToast,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBrandsAdd } from 'ui-modules/modules/brands/hooks/useBrandsAdd';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type TForm = z.infer<typeof schema>;

export const CreateBrand = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { addBrand, loading } = useBrandsAdd();

  const form = useForm<TForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = form.handleSubmit((data) => {
    addBrand({
      variables: data,
      onCompleted: () => {
        toast({ variant: 'success', title: t('brand-created') });
        form.reset();
      },
      onError: (error) =>
        toast({ title: t('error'), description: error.message, variant: 'destructive' }),
    });
  });

  return (
    <Sheet onOpenChange={(open) => !open && form.reset()}>
      <Sheet.Trigger asChild>
        <Button variant="ghost" size="icon">
          <IconPlus />
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0">
        <Form {...form}>
          <form className="flex flex-col size-full gap-0" onSubmit={onSubmit}>
            <Sheet.Header>
              <Sheet.Title>{t('create-brand')}</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow flex flex-col px-5 py-4 gap-4">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('name')}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('description')}</Form.Label>
                    <Form.Control>
                      <Textarea {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </Sheet.Content>
            <Sheet.Footer>
              <Sheet.Close asChild>
                <Button variant="ghost">{t('cancel')}</Button>
              </Sheet.Close>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : t('create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
