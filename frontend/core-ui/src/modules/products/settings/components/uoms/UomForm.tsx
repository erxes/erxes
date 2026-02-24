import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Sheet, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IUom } from 'ui-modules';
import { useUomsAdd } from '../../hooks/useUomsAdd';
import { useUomsEdit } from '../../hooks/useUomsEdit';
import { useTranslation } from 'react-i18next';

const uomFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
});

interface IUomFormProps {
  uom?: IUom;
  onOpenChange?: (open: boolean) => void;
}

export const UomForm = ({ uom, onOpenChange }: IUomFormProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('product', {
    keyPrefix: 'add',
  });
  const { uomsAdd, loading: loadingAdd } = useUomsAdd();
  const { uomsEdit, loading: loadingEdit } = useUomsEdit();

  const form = useForm<{ name: string; code: string }>({
    defaultValues: uom
      ? { name: uom.name, code: uom.code }
      : { name: '', code: '' },
    resolver: zodResolver(uomFormSchema),
  });

  const handleCancel = () => {
    form.reset();
    onOpenChange?.(false);
  };

  const onSubmit = (data: { name: string; code: string }) => {
    if (uom) {
      uomsEdit({
        variables: { id: uom._id, ...data },
        onCompleted: () => {
          onOpenChange?.(false);
        },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    } else {
      uomsAdd({
        variables: { ...data },
        onCompleted: () => {
          form.reset();
          onOpenChange?.(false);
        },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex overflow-hidden flex-col h-full"
      >
        <Sheet.Header className="flex-row gap-3 items-center p-5 space-y-0 border-b">
          <Sheet.Title>{uom ? t('edit-uom') : t('add-uom')}</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            {uom ? t('edit-uom') : t('add-uom')}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <div className="flex gap-2 justify-center p-5 w-full">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item className="w-full">
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control>
                    <Input placeholder={t('name')} {...field} autoFocus />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="code"
              render={({ field }) => (
                <Form.Item className="w-full">
                  <Form.Label>{t('code')}</Form.Label>
                  <Form.Control>
                    <Input
                      placeholder={t('code')}
                      {...field}
                      className="w-full"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={handleCancel}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={loadingAdd || loadingEdit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loadingAdd || loadingEdit ? t('creating') : t('create')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
